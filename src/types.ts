export type Modality = 'online' | 'in-person' | 'hybrid';

export type FundingType =
  | 'fully_funded'
  | 'partially_funded'
  | 'self_funded'
  | 'paid'
  | 'prize'
  | 'unpaid';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type EducationLevel =
  | 'High School'
  | 'Undergraduate'
  | 'Graduate'
  | 'Master'
  | 'PhD'
  | 'Postdoc'
  | 'Early Career'
  | 'Any';

export type Category =
  | 'Scholarships'
  | 'Fellowships'
  | 'Grants'
  | 'Competitions'
  | 'Hackathons'
  | 'Research'
  | 'Internships'
  | 'Jobs'
  | 'Exchanges'
  | 'Summer schools'
  | 'Conferences'
  | 'Awards'
  | 'Youth programs'
  | 'Leadership programs'
  | 'Entrepreneurship'
  | 'Incubators'
  | 'Accelerators'
  | 'Volunteering'
  | 'Training'
  | 'Study abroad'
  | 'Travel-funded programs'
  | 'Creative opportunities'
  | 'Academic opportunities'
  | 'Professional opportunities';

export interface OpportunitySource {
  sourceName: string;
  sourceType: 'official' | 'partner' | 'public_feed' | 'verified_indexer';
  sourceUrl: string;
  retrievedAt: string;
  notes?: string;
}

export interface Opportunity {
  canonicalOpportunityId: string;
  title: string;
  organization: string;
  category: Category;
  subcategory?: string;
  description: string;
  officialSourceUrl: string;
  applicationUrl: string;
  country: string;
  region?: string;
  worldwide: boolean;
  modality: Modality;
  minAge?: number;
  maxAge?: number;
  citizenshipRequirements?: string[]; // e.g. ['Pakistan', 'Global South', 'Any']
  residencyRequirements?: string[];
  educationRequirements?: EducationLevel[];
  degreeRequirements?: string[]; // e.g. ['BS', 'BA', 'BSc', 'MS', 'PhD', 'Any']
  yearRequirements?: number[]; // e.g. [1, 2, 3, 4] for undergraduate years
  fieldRequirements?: string[]; // e.g. ['Psychology', 'Computer Science', 'All Fields']
  skills?: string[];
  experience?: string;
  deadline?: string; // YYYY-MM-DD or ISO string, or undefined for rolling/no deadline
  openingDate?: string;
  startDate?: string;
  duration?: string;
  funding: FundingType;
  prize?: string;
  stipend?: string;
  travelSupport?: boolean;
  accommodationSupport?: boolean;
  applicationFee?: number; // 0 = free
  eligibilityExplanation?: string;
  requiredDocuments?: string[];
  verificationStatus: VerificationStatus;
  lastVerified: string;
  sourceCount: number;
  duplicateNotes?: string;
  sources: OpportunitySource[];
}

export interface UserProfile {
  age: number;
  country: string;
  citizenship: string;
  educationLevel: EducationLevel;
  degree: string;
  field: string;
  year: number; // e.g. 2 for 2nd year
  interests: string[];
  skills: string[];
  experience: string;
  budget: number; // in USD
  desiredCountries: string[];
  modalityPreference: 'any' | 'online' | 'in-person' | 'hybrid';
  fundingRequirement: 'any' | 'fully_funded_only' | 'paid_or_funded';
  goals: string[];
}

export interface RequirementEvaluation {
  criterion: string;
  userValue: string | number;
  requiredValue: string;
  passed: boolean;
  isSoftConstraint?: boolean;
  note?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  eligibilityScore: number; // 0 to 100
  reasons: string[];
  watchouts: string[];
  matchedRequirements: RequirementEvaluation[];
  failedRequirements: RequirementEvaluation[];
}

export interface MatchFactorBreakdown {
  name: string;
  category: 'Eligibility' | 'Profile' | 'Goal' | 'Funding' | 'Location' | 'Deadline';
  score: number; // points earned
  maxScore: number; // max possible
  description: string;
}

export interface MatchScoreResult {
  totalScore: number; // 0 to 100
  isEligible: boolean;
  eligibility: EligibilityResult;
  factors: MatchFactorBreakdown[];
  matchSummary: string;
  whyItMatches: string[];
  keyHighlights: string[];
}

export interface GoalDiscoverySuggestion {
  relatedCategory: Category;
  opportunityCount: number;
  reasonPhrase: string;
  targetedGoal: string;
  sampleOpportunityTitles: string[];
}

export type DeadlineStatus =
  | 'closing_today'
  | 'closing_soon' // < 7 days
  | 'closing_this_month' // < 30 days
  | 'opening_soon'
  | 'newly_added'
  | 'no_deadline'
  | 'expired';

export interface SourceRegistryEntry {
  sourceId: string;
  sourceName: string;
  officialUrl: string;
  categoriesCovered: Category[];
  countriesCovered: string[];
  connectorType: 'API' | 'RSS/feed' | 'Structured public data' | 'Partnership' | 'Manual/link-only';
  permissionStatus: 'Authorized' | 'Public Open Data' | 'Link Only (No Scrape)' | 'Partnership In Review';
  usageNotes: string;
  lastChecked: string;
  lastSuccessfulSync: string;
  syncFrequency: 'Real-time' | 'Daily' | 'Weekly' | 'Bi-weekly' | 'Manual Verification';
  activeStatus: 'Active' | 'Paused' | 'Maintenance';
  importCount: number;
  errorStatus: 'Healthy' | 'Sync Warning' | 'Rate Limited' | 'Idle';
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: Category[];
  country: string;
  worldwideOnly: boolean;
  modalities: Modality[];
  fundingTypes: FundingType[];
  freeApplicationOnly: boolean;
  deadlineFilter: 'all' | 'closing_soon' | 'closing_this_month' | 'opening_soon' | 'active_only' | 'no_deadline';
  eligibleOnly: boolean;
  savedOnly: boolean;
  sortBy: 'best_match' | 'deadline_asc' | 'funding_high' | 'newest';
}
