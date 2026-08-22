import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Opportunity,
  UserProfile,
  FilterState,
  MatchScoreResult,
  Category,
  SourceRegistryEntry,
  GoalDiscoverySuggestion,
  ApplicationStatus,
  ApplicationRecord,
} from '../types';
import { DEMO_OPPORTUNITIES } from '../data/demoOpportunities';
import { DEMO_PROFILE } from '../data/defaultProfile';
import { SOURCE_REGISTRY } from '../data/sourceRegistry';
import { calculateMatchScore } from '../engine/matchingEngine';
import { deduplicateOpportunities } from '../engine/deduplication';
import { generateGoalDiscoverySuggestions } from '../engine/goalDiscoveryEngine';
import { fetchAggregatedOpportunities, getCachedAggregatedOpportunities, isOpportunityForProfile, AggregatorSourceStatus } from '../aggregator/aggregator';

interface ScoredOpportunity {
  opportunity: Opportunity;
  matchResult: MatchScoreResult;
}

interface AppContextType {
  // Opportunities & Data
  opportunities: Opportunity[];
  scoredOpportunities: ScoredOpportunity[];
  filteredOpportunities: ScoredOpportunity[];
  savedOpportunityIds: string[];
  toggleSaveOpportunity: (canonicalId: string) => void;
  isSaved: (canonicalId: string) => boolean;
  applications: Record<string, ApplicationRecord>;
  applyToOpportunity: (canonicalId: string) => void;
  updateApplicationStatus: (canonicalId: string, status: ApplicationStatus) => void;
  updateApplicationNotes: (canonicalId: string, notes: string) => void;
  isApplied: (canonicalId: string) => boolean;

  // Profile
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  resetToDemoProfile: () => void;
  loadAlternativeProfile: (profile: UserProfile) => void;

  // Modals & UI State
  selectedOpportunity: Opportunity | null;
  setSelectedOpportunity: (opp: Opportunity | null) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isSourceRegistryOpen: boolean;
  setIsSourceRegistryOpen: (open: boolean) => void;
  isJsonImportOpen: boolean;
  setIsJsonImportOpen: (open: boolean) => void;

  // Filters & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  setQuickCategory: (category: Category | 'All') => void;

  // Goal Discovery
  goalSuggestions: GoalDiscoverySuggestion[];

  // Source Registry
  sourceRegistry: SourceRegistryEntry[];

  // JSON Import/Export
  importJsonOpportunities: (jsonStr: string) => { success: boolean; count: number; error?: string };
  exportJsonDataset: () => string;
  resetDatasetToDefault: () => void;

  // Stats
  stats: {
    total: number;
    eligibleCount: number;
    fullyFundedCount: number;
    savedCount: number;
    closingSoonCount: number;
  };

  // View Mode
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  activeView: 'opportunities' | 'applications';
  setActiveView: (view: 'opportunities' | 'applications') => void;
  aggregator: {
    isLoading: boolean;
    lastUpdated: string | null;
    sourceCount: number;
    sourceStatuses: AggregatorSourceStatus[];
    refresh: () => Promise<void>;
  };
}

const STORAGE_KEYS = {
  PROFILE: 'pathlight_user_profile_v1',
  SAVED: 'pathlight_saved_opportunities_v1',
  APPLICATIONS: 'pathlight_applications_v1',
  CUSTOM_OPPS: 'pathlight_custom_opportunities_v1',
  AGGREGATED: 'pathlight_aggregated_opportunities_v1',
  AGGREGATED_UPDATED: 'pathlight_aggregated_updated_v1',
};

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  selectedCategories: [],
  country: '',
  worldwideOnly: false,
  modalities: [],
  fundingTypes: [],
  freeApplicationOnly: false,
  deadlineFilter: 'all',
  eligibleOnly: false,
  savedOnly: false,
  source: '',
  sortBy: 'best_match',
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load profile from localStorage', e);
    }
    return DEMO_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage', e);
    }
  }, [profile]);

  // 2. Saved Opportunities
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved IDs', e);
    }
    return ['opp_ugrad_exchange_2026']; // Default saved demo item
  });

  const [applications, setApplications] = useState<Record<string, ApplicationRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load applications', e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.warn('Failed to save applications', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(savedOpportunityIds));
    } catch (e) {
      console.warn('Failed to persist saved IDs', e);
    }
  }, [savedOpportunityIds]);

  // 3. Opportunities Dataset (Base + Custom)
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    try {
      const savedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_OPPS);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateOpportunities([...DEMO_OPPORTUNITIES, ...parsed]);
        }
      }
    } catch (e) {
      console.warn('Failed to load custom opportunities', e);
    }
    const cached = getCachedAggregatedOpportunities();
    return deduplicateOpportunities([...DEMO_OPPORTUNITIES, ...cached]);
  });

  const [aggregatedOpportunities, setAggregatedOpportunities] = useState<Opportunity[]>(() => getCachedAggregatedOpportunities());
  const [isAggregatorLoading, setIsAggregatorLoading] = useState(false);
  const [aggregatorLastUpdated, setAggregatorLastUpdated] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AGGREGATED_UPDATED);
    } catch {
      return null;
    }
  });
  const [aggregatorSourceStatuses, setAggregatorSourceStatuses] = useState<AggregatorSourceStatus[]>([]);

  // 4. UI Modals
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSourceRegistryOpen, setIsSourceRegistryOpen] = useState(false);
  const [isJsonImportOpen, setIsJsonImportOpen] = useState(false);

  // 5. Filters
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // 6. View Mode (Grid vs List)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeView, setActiveView] = useState<'opportunities' | 'applications'>('opportunities');

  const refreshAggregator = async () => {
    setIsAggregatorLoading(true);
    try {
      const result = await fetchAggregatedOpportunities();
      setAggregatorSourceStatuses(result.sourceStatuses);
      if (result.opportunities.length > 0) {
        setAggregatedOpportunities(result.opportunities);
        setOpportunities((prev) => deduplicateOpportunities([...DEMO_OPPORTUNITIES, ...result.opportunities]));
        setAggregatorLastUpdated(result.updatedAt);
        localStorage.setItem(STORAGE_KEYS.AGGREGATED_UPDATED, result.updatedAt);
      }
    } catch (error) {
      console.warn('Opportunity sources could not be refreshed', error);
    } finally {
      setIsAggregatorLoading(false);
    }
  };

  useEffect(() => {
    void refreshAggregator();
  }, []);

  // Helper actions
  const toggleSaveOpportunity = (canonicalId: string) => {
    setSavedOpportunityIds((prev) =>
      prev.includes(canonicalId)
        ? prev.filter((id) => id !== canonicalId)
        : [...prev, canonicalId]
    );
  };

  const isSaved = (canonicalId: string) => savedOpportunityIds.includes(canonicalId);

  const applyToOpportunity = (canonicalId: string) => {
    setApplications((prev) => ({
      ...prev,
      [canonicalId]: prev[canonicalId] || { status: 'Applied', appliedAt: new Date().toISOString(), notes: '' },
    }));
  };

  const updateApplicationStatus = (canonicalId: string, status: ApplicationStatus) => {
    setApplications((prev) => ({ ...prev, [canonicalId]: { ...prev[canonicalId], status } }));
  };

  const updateApplicationNotes = (canonicalId: string, notes: string) => {
    setApplications((prev) => ({ ...prev, [canonicalId]: { ...prev[canonicalId], notes } }));
  };

  const isApplied = (canonicalId: string) => Boolean(applications[canonicalId]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const resetToDemoProfile = () => {
    setProfile(DEMO_PROFILE);
  };

  const loadAlternativeProfile = (newProf: UserProfile) => {
    setProfile(newProf);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const setQuickCategory = (cat: Category | 'All') => {
    if (cat === 'All') {
      updateFilter('selectedCategories', []);
    } else {
      updateFilter('selectedCategories', [cat]);
    }
  };

  // 6. Transparent Score Calculations for all opportunities
  const scoredOpportunities = useMemo<ScoredOpportunity[]>(() => {
    return opportunities.map((opp) => ({
      opportunity: opp,
      matchResult: calculateMatchScore(opp, profile),
    }));
  }, [opportunities, profile]);

  // 7. Filter & Search Pipeline
  const filteredOpportunities = useMemo<ScoredOpportunity[]>(() => {
    let list = [...scoredOpportunities];

    // Search query filter (matches title, org, field, skills, description, country)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(({ opportunity: o }) => {
        const titleMatch = o.title.toLowerCase().includes(q);
        const orgMatch = o.organization.toLowerCase().includes(q);
        const descMatch = o.description.toLowerCase().includes(q);
        const catMatch = o.category.toLowerCase().includes(q);
        const countryMatch = o.country.toLowerCase().includes(q);
        const fieldsMatch = o.fieldRequirements?.some((f) => f.toLowerCase().includes(q));
        const skillsMatch = o.skills?.some((s) => s.toLowerCase().includes(q));
        return titleMatch || orgMatch || descMatch || catMatch || countryMatch || fieldsMatch || skillsMatch;
      });
    }

    // Automatic profile matching for live and imported records.
    list = list.filter(({ opportunity: o }) => isOpportunityForProfile(o, profile));

    if (filters.source) {
      list = list.filter(({ opportunity: o }) => o.sources.some((source) => source.sourceName === filters.source));
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      list = list.filter(({ opportunity: o }) => filters.selectedCategories.includes(o.category));
    }

    // Country / Worldwide
    if (filters.worldwideOnly) {
      list = list.filter(({ opportunity: o }) => o.worldwide || o.modality === 'online');
    } else if (filters.country) {
      const c = filters.country.toLowerCase();
      list = list.filter(({ opportunity: o }) => o.country.toLowerCase().includes(c) || o.worldwide);
    }

    // Modalities
    if (filters.modalities.length > 0) {
      list = list.filter(({ opportunity: o }) => filters.modalities.includes(o.modality));
    }

    // Funding types
    if (filters.fundingTypes.length > 0) {
      list = list.filter(({ opportunity: o }) => filters.fundingTypes.includes(o.funding));
    }

    // Free application fee only
    if (filters.freeApplicationOnly) {
      list = list.filter(({ opportunity: o }) => o.applicationFee === 0 || o.applicationFee === undefined);
    }

    // Eligible Only toggle
    if (filters.eligibleOnly) {
      list = list.filter(({ matchResult }) => matchResult.isEligible);
    }

    // Saved Only toggle
    if (filters.savedOnly) {
      list = list.filter(({ opportunity: o }) => savedOpportunityIds.includes(o.canonicalOpportunityId));
    }

    // Deadline Filters
    if (filters.deadlineFilter !== 'all') {
      const now = new Date();
      list = list.filter(({ opportunity: o }) => {
        if (!o.deadline) {
          return filters.deadlineFilter === 'no_deadline' || filters.deadlineFilter === 'active_only';
        }
        const dl = new Date(o.deadline);
        const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          return false; // exclude expired for these filters
        }
        if (filters.deadlineFilter === 'closing_soon') {
          return diffDays >= 0 && diffDays <= 7;
        }
        if (filters.deadlineFilter === 'closing_this_month') {
          return diffDays >= 0 && diffDays <= 30;
        }
        if (filters.deadlineFilter === 'opening_soon') {
          if (!o.openingDate) return false;
          const op = new Date(o.openingDate);
          return op.getTime() > now.getTime();
        }
        if (filters.deadlineFilter === 'no_deadline') {
          return false;
        }
        return true;
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (filters.sortBy === 'best_match') {
        // First by score descending, then by eligibility
        if (a.matchResult.isEligible !== b.matchResult.isEligible) {
          return a.matchResult.isEligible ? -1 : 1;
        }
        return b.matchResult.totalScore - a.matchResult.totalScore;
      }
      if (filters.sortBy === 'deadline_asc') {
        if (!a.opportunity.deadline) return 1;
        if (!b.opportunity.deadline) return -1;
        return new Date(a.opportunity.deadline).getTime() - new Date(b.opportunity.deadline).getTime();
      }
      if (filters.sortBy === 'funding_high') {
        const scoreFunding = (f: string) => (f === 'fully_funded' ? 4 : f === 'paid' ? 3 : f === 'prize' ? 2 : 1);
        return scoreFunding(b.opportunity.funding) - scoreFunding(a.opportunity.funding);
      }
      if (filters.sortBy === 'newest') {
        return new Date(b.opportunity.lastVerified).getTime() - new Date(a.opportunity.lastVerified).getTime();
      }
      return 0;
    });

    return list;
  }, [scoredOpportunities, filters, savedOpportunityIds]);

  // 8. Goal Discovery Suggestions ("You didn't know these existed")
  const goalSuggestions = useMemo<GoalDiscoverySuggestion[]>(() => {
    return generateGoalDiscoverySuggestions(
      filters.searchQuery,
      filters.selectedCategories,
      opportunities,
      profile
    );
  }, [filters.searchQuery, filters.selectedCategories, opportunities, profile]);

  // 9. Statistics
  const stats = useMemo(() => {
    const total = opportunities.length;
    const eligibleCount = scoredOpportunities.filter((s) => s.matchResult.isEligible).length;
    const fullyFundedCount = opportunities.filter((o) => o.funding === 'fully_funded').length;
    const savedCount = savedOpportunityIds.length;

    const now = new Date();
    const closingSoonCount = opportunities.filter((o) => {
      if (!o.deadline) return false;
      const dl = new Date(o.deadline);
      const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    return {
      total,
      eligibleCount,
      fullyFundedCount,
      savedCount,
      closingSoonCount,
    };
  }, [opportunities, scoredOpportunities, savedOpportunityIds]);

  // 10. JSON Import/Export handlers
  const importJsonOpportunities = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      const list = Array.isArray(parsed) ? parsed : [parsed];

      if (list.length === 0) {
        return { success: false, count: 0, error: 'JSON array is empty.' };
      }

      // Basic schema check
      const validItems: Opportunity[] = [];
      for (const item of list) {
        if (!item.title || !item.organization || !item.category) {
          return {
            success: false,
            count: 0,
            error: `Item missing required fields: title, organization, or category (id: ${item.canonicalOpportunityId || 'unknown'}).`,
          };
        }
        validItems.push({
          canonicalOpportunityId: item.canonicalOpportunityId || `opp_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: item.title,
          organization: item.organization,
          category: item.category,
          subcategory: item.subcategory,
          description: item.description || 'Imported verified opportunity record.',
          officialSourceUrl: item.officialSourceUrl || 'https://pathlight.org',
          applicationUrl: item.applicationUrl || item.officialSourceUrl || 'https://pathlight.org',
          country: item.country || 'Worldwide',
          region: item.region,
          worldwide: Boolean(item.worldwide),
          modality: item.modality || 'online',
          minAge: item.minAge,
          maxAge: item.maxAge,
          citizenshipRequirements: item.citizenshipRequirements,
          residencyRequirements: item.residencyRequirements,
          educationRequirements: item.educationRequirements,
          degreeRequirements: item.degreeRequirements,
          yearRequirements: item.yearRequirements,
          fieldRequirements: item.fieldRequirements,
          skills: item.skills,
          experience: item.experience,
          deadline: item.deadline,
          openingDate: item.openingDate,
          startDate: item.startDate,
          duration: item.duration,
          funding: item.funding || 'fully_funded',
          prize: item.prize,
          stipend: item.stipend,
          travelSupport: item.travelSupport,
          accommodationSupport: item.accommodationSupport,
          applicationFee: item.applicationFee ?? 0,
          eligibilityExplanation: item.eligibilityExplanation,
          requiredDocuments: item.requiredDocuments,
          verificationStatus: item.verificationStatus || 'verified',
          lastVerified: item.lastVerified || new Date().toISOString().split('T')[0],
          sourceCount: item.sourceCount || 1,
          duplicateNotes: item.duplicateNotes,
          sources: item.sources || [
            {
              sourceName: 'Direct JSON Import',
              sourceType: 'official',
              sourceUrl: item.officialSourceUrl || 'https://pathlight.org',
              retrievedAt: new Date().toISOString().split('T')[0],
            },
          ],
        });
      }

      setOpportunities((prev) => {
        const combined = deduplicateOpportunities([...prev, ...validItems]);
        try {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_OPPS, JSON.stringify(validItems));
        } catch (e) {
          console.warn('Failed to save imported opps', e);
        }
        return combined;
      });

      return { success: true, count: validItems.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Invalid JSON syntax' };
    }
  };

  const exportJsonDataset = () => {
    return JSON.stringify(opportunities, null, 2);
  };

  const resetDatasetToDefault = () => {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_OPPS);
    setOpportunities(deduplicateOpportunities(DEMO_OPPORTUNITIES));
  };

  return (
    <AppContext.Provider
      value={{
        opportunities,
        scoredOpportunities,
        filteredOpportunities,
        savedOpportunityIds,
        toggleSaveOpportunity,
        isSaved,
        applications,
        applyToOpportunity,
        updateApplicationStatus,
        isApplied,
        updateApplicationNotes,
        profile,
        updateProfile,
        resetToDemoProfile,
        loadAlternativeProfile,
        selectedOpportunity,
        setSelectedOpportunity,
        isProfileOpen,
        setIsProfileOpen,
        isSourceRegistryOpen,
        setIsSourceRegistryOpen,
        isJsonImportOpen,
        setIsJsonImportOpen,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        setQuickCategory,
        goalSuggestions,
        sourceRegistry: SOURCE_REGISTRY,
        importJsonOpportunities,
        exportJsonDataset,
        resetDatasetToDefault,
        stats,
        viewMode,
        setViewMode,
        activeView,
        setActiveView,
        aggregator: {
          isLoading: isAggregatorLoading,
          lastUpdated: aggregatorLastUpdated,
          sourceCount: aggregatedOpportunities.length,
          sourceStatuses: aggregatorSourceStatuses,
          refresh: refreshAggregator,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
