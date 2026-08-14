import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Opportunity,
  UserProfile,
  FilterState,
  MatchScoreResult,
  Category,
  SourceRegistryEntry,
  GoalDiscoverySuggestion,
} from '../types';
import { DEMO_OPPORTUNITIES } from '../data/demoOpportunities';
import { DEMO_PROFILE } from '../data/defaultProfile';
import { SOURCE_REGISTRY } from '../data/sourceRegistry';
import { calculateMatchScore } from '../engine/matchingEngine';
import { deduplicateOpportunities } from '../engine/deduplication';
import { generateGoalDiscoverySuggestions } from '../engine/goalDiscoveryEngine';
import { createDiscoveryProvider, DiscoverySignals } from '../engine/aiDiscovery';
import { GrantsGovConnector, ConnectorFetchResult } from '../engine/connectors';

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

  // Current View
  currentView: 'landing' | 'explore' | 'saved';
  setCurrentView: (view: 'landing' | 'explore' | 'saved') => void;

  // Filters & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  setQuickCategory: (category: Category | 'All') => void;

  // Goal Discovery
  goalSuggestions: GoalDiscoverySuggestion[];

  // Natural-language discovery
  discoveryInput: string;
  discoverySignals: DiscoverySignals | null;
  applyDiscoveryIntent: (prompt: string) => DiscoverySignals;
  clearDiscoveryIntent: () => void;

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

  // Connector Management
  fetchFromConnectors: () => Promise<void>;
  connectorStatuses: Record<string, { status: string; message: string; recordCount: number }>;
  isConnectorFetching: boolean;
  lastConnectorSync: string | null;
}

const STORAGE_KEYS = {
  PROFILE: 'pathlight_user_profile_v1',
  SAVED: 'pathlight_saved_opportunities_v1',
  CUSTOM_OPPS: 'pathlight_custom_opportunities_v1',
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
    return deduplicateOpportunities(DEMO_OPPORTUNITIES);
  });

  // 4. UI Modals & Views
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSourceRegistryOpen, setIsSourceRegistryOpen] = useState(false);
  const [isJsonImportOpen, setIsJsonImportOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'explore' | 'saved'>('landing');

  // 5. Filters
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [discoveryInput, setDiscoveryInput] = useState('');
  const [discoverySignals, setDiscoverySignals] = useState<DiscoverySignals | null>(null);
  const discoveryProvider = useMemo(() => createDiscoveryProvider(), []);

  // 6. View Mode (Grid vs List)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 7. Connector Management
  const [isConnectorFetching, setIsConnectorFetching] = useState(false);
  const [lastConnectorSync, setLastConnectorSync] = useState<string | null>(null);
  const [connectorStatuses, setConnectorStatuses] = useState<Record<string, { status: string; message: string; recordCount: number }>>({});

  // Fetch from live connectors
  const fetchFromConnectors = async () => {
    if (isConnectorFetching) return;

    setIsConnectorFetching(true);
    const statuses: Record<string, { status: string; message: string; recordCount: number }> = {};

    try {
      // Fetch from Grants.gov
      const grantsConnector = new GrantsGovConnector();
      const grantsResult = await grantsConnector.fetch({ limit: 50 });

      statuses['grants_gov'] = {
        status: grantsResult.sourceStatus,
        message: grantsResult.message,
        recordCount: grantsResult.fetchedCount,
      };

      // Add fetched records to opportunities
      if (grantsResult.success && grantsResult.records.length > 0) {
        setOpportunities((prev) => {
          const combined = deduplicateOpportunities([...prev, ...grantsResult.records]);
          return combined;
        });
      }
    } catch (error) {
      console.warn('Connector fetch error:', error);
      statuses['grants_gov'] = {
        status: 'ERROR',
        message: `Connector error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recordCount: 0,
      };
    } finally {
      setConnectorStatuses(statuses);
      setLastConnectorSync(new Date().toISOString());
      setIsConnectorFetching(false);
    }
  };
  const toggleSaveOpportunity = (canonicalId: string) => {
    setSavedOpportunityIds((prev) =>
      prev.includes(canonicalId)
        ? prev.filter((id) => id !== canonicalId)
        : [...prev, canonicalId]
    );
  };

  const isSaved = (canonicalId: string) => savedOpportunityIds.includes(canonicalId);

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
    setDiscoveryInput('');
    setDiscoverySignals(null);
  };

  const applyDiscoveryIntent = (prompt: string) => {
    const safePrompt = prompt.trim();
    if (!safePrompt) {
      setDiscoveryInput('');
      setDiscoverySignals(null);
      return {
        fundingTypes: [],
        categories: [],
        searchTerms: [],
        worldwideOnly: false,
        freeApplicationOnly: false,
        noMajorRestriction: false,
        preferredCountries: [],
        summary: 'Pathlight is ready to understand a new opportunity brief.',
        hardEligibilityGuard: false,
      };
    }

    const signals = discoveryProvider.interpret(safePrompt);
    setDiscoveryInput(safePrompt);
    setDiscoverySignals(signals);

    setFilters((prev) => {
      const mergedSearchTerms = Array.from(new Set([prev.searchQuery.trim(), ...signals.searchTerms].filter(Boolean))).join(' ');
      const mergedFundingTypes = Array.from(new Set([...prev.fundingTypes, ...signals.fundingTypes]));
      const mergedCategories = Array.from(new Set([...prev.selectedCategories, ...signals.categories]));
      const mergedCountry = prev.country || (signals.preferredCountries[0] ?? '');

      return {
        ...prev,
        searchQuery: mergedSearchTerms,
        selectedCategories: mergedCategories,
        fundingTypes: mergedFundingTypes,
        worldwideOnly: prev.worldwideOnly || signals.worldwideOnly,
        freeApplicationOnly: prev.freeApplicationOnly || signals.freeApplicationOnly,
        country: mergedCountry,
      };
    });

    return signals;
  };

  const clearDiscoveryIntent = () => {
    setDiscoveryInput('');
    setDiscoverySignals(null);
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
        currentView,
        setCurrentView,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        setQuickCategory,
        goalSuggestions,
        discoveryInput,
        discoverySignals,
        applyDiscoveryIntent,
        clearDiscoveryIntent,
        sourceRegistry: SOURCE_REGISTRY,
        importJsonOpportunities,
        exportJsonDataset,
        resetDatasetToDefault,
        stats,
        viewMode,
        setViewMode,
        fetchFromConnectors,
        connectorStatuses,
        isConnectorFetching,
        lastConnectorSync,
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
