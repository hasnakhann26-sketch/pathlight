import { Opportunity, UserProfile, Category, GoalDiscoverySuggestion } from '../types';
import { evaluateEligibility } from './eligibilityEngine';

interface CategoryGoalMap {
  targetCategory: Category;
  relevantGoals: string[];
  explanationTemplate: (searchedTerm: string, goal: string) => string;
}

const CATEGORY_GOAL_MAPPINGS: CategoryGoalMap[] = [
  {
    targetCategory: 'Exchanges',
    relevantGoals: ['Study abroad', 'International Opportunities', 'Build academic CV', 'Cross-cultural'],
    explanationTemplate: (searched, goal) =>
      `You searched for ${searched}. Pathlight surfaced fully-funded exchange semesters that achieve your goal to "${goal}" without full degree tuition costs.`,
  },
  {
    targetCategory: 'Research',
    relevantGoals: ['Conduct cross-cultural research', 'Build academic CV', 'Publish academic paper', 'Research'],
    explanationTemplate: (searched, goal) =>
      `You searched for ${searched}. Pathlight also discovered lab research internships providing direct faculty mentorship and stipends to support your goal to "${goal}".`,
  },
  {
    targetCategory: 'Conferences',
    relevantGoals: ['Study abroad', 'Network with global leaders', 'Build academic CV', 'International Opportunities'],
    explanationTemplate: (searched, goal) =>
      `You searched for ${searched}. Fully travel-funded international conferences and summits were found to accelerate your goal to "${goal}".`,
  },
  {
    targetCategory: 'Fellowships',
    relevantGoals: ['Secure graduate funding', 'Build academic CV', 'Launch a startup/initiative', 'Gain industry mentorship'],
    explanationTemplate: (searched, goal) =>
      `You searched for ${searched}. Fellowships offer independent funding, stipends, and global recognition aligned with your goal to "${goal}".`,
  },
  {
    targetCategory: 'Grants',
    relevantGoals: ['Conduct cross-cultural research', 'Launch a startup/initiative', 'Publish academic paper'],
    explanationTemplate: (searched, goal) =>
      `You searched for ${searched}. Early-career project grants were identified that directly fund your research and fieldwork.`,
  },
  {
    targetCategory: 'Hackathons',
    relevantGoals: ['Win international hackathon', 'Build academic CV', 'Upskill in emerging technology', 'AI'],
    explanationTemplate: (searched, goal) =>
      `You searched for ${searched}. High-impact global hackathons and competitions were discovered with prize grants and international recognition.`,
  },
  {
    targetCategory: 'Scholarships',
    relevantGoals: ['Study abroad', 'Research', 'Build academic CV'],
    explanationTemplate: (searched, goal) =>
      `You searched for ${searched}. Fully funded international summer institutes offer intensive training and global exposure for your goal to "${goal}".`,
  },
  {
    targetCategory: 'Exchanges',
    relevantGoals: ['Study abroad', 'Network with global leaders', 'International Opportunities'],
    explanationTemplate: (searched, goal) =>
      `You searched for ${searched}. Travel-funded youth programs cover all international flights and accommodations to advance your global trajectory.`,
  },
];

export function generateGoalDiscoverySuggestions(
  currentSearchQuery: string,
  selectedCategories: Category[],
  allOpportunities: Opportunity[],
  profile: UserProfile
): GoalDiscoverySuggestion[] {
  const suggestions: GoalDiscoverySuggestion[] = [];

  // Determine what the user is currently looking at
  const isSearchingScholarships =
    currentSearchQuery.toLowerCase().includes('scholarship') ||
    selectedCategories.includes('Scholarships') ||
    (selectedCategories.length === 0 && currentSearchQuery.length > 0);

  const searchedConcept = currentSearchQuery.trim()
    ? `"${currentSearchQuery.trim()}"`
    : selectedCategories.length > 0
    ? selectedCategories.join(', ')
    : 'opportunities';

  // Iterate through mappings
  for (const mapping of CATEGORY_GOAL_MAPPINGS) {
    // Skip if user already selected this category exclusively
    if (selectedCategories.length === 1 && selectedCategories.includes(mapping.targetCategory)) {
      continue;
    }

    // Check if user has an aligned goal or interest
    const matchedGoal = profile.goals.find((userGoal) =>
      mapping.relevantGoals.some((reqGoal) =>
        userGoal.toLowerCase().includes(reqGoal.toLowerCase()) ||
        reqGoal.toLowerCase().includes(userGoal.toLowerCase())
      )
    ) || profile.interests.find((userInterest) =>
      mapping.relevantGoals.some((reqGoal) =>
        userInterest.toLowerCase().includes(reqGoal.toLowerCase()) ||
        reqGoal.toLowerCase().includes(userInterest.toLowerCase())
      )
    );

    if (!matchedGoal) continue;

    // Find eligible opportunities in this category
    const categoryOpps = allOpportunities.filter((opp) => {
      if (opp.category !== mapping.targetCategory) return false;
      const el = evaluateEligibility(opp, profile);
      return el.eligible;
    });

    if (categoryOpps.length > 0) {
      suggestions.push({
        relatedCategory: mapping.targetCategory,
        opportunityCount: categoryOpps.length,
        reasonPhrase: mapping.explanationTemplate(searchedConcept, matchedGoal),
        targetedGoal: matchedGoal,
        sampleOpportunityTitles: categoryOpps.slice(0, 3).map((o) => o.title),
      });
    }
  }

  return suggestions.slice(0, 3); // top 3 most relevant alternative pathways
}
