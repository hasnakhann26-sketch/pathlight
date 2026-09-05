import { Opportunity, UserProfile, MatchScoreResult, MatchFactorBreakdown, DeadlineStatus } from '../types';
import { evaluateEligibility } from './eligibilityEngine';

export function calculateDeadlineStatus(deadlineStr?: string, openingDateStr?: string): {
  status: DeadlineStatus;
  daysRemaining?: number;
  label: string;
  badgeColor: string;
} {
  if (!deadlineStr) {
    return {
      status: 'no_deadline',
      label: 'Rolling / No Deadline',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      daysRemaining: diffDays,
      label: 'Deadline Passed',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
    };
  }

  if (diffDays === 0) {
    return {
      status: 'closing_today',
      daysRemaining: 0,
      label: 'Closing Today!',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
    };
  }

  if (diffDays <= 7) {
    return {
      status: 'closing_soon',
      daysRemaining: diffDays,
      label: `Closing in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  if (diffDays <= 30) {
    return {
      status: 'closing_this_month',
      daysRemaining: diffDays,
      label: `Closing in ${diffDays} days`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  if (openingDateStr) {
    const opening = new Date(openingDateStr);
    if (opening.getTime() > now.getTime()) {
      return {
        status: 'opening_soon',
        daysRemaining: diffDays,
        label: `Opens ${openingDateStr}`,
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      };
    }
  }

  return {
    status: 'newly_added',
    daysRemaining: diffDays,
    label: `Deadline: ${deadlineStr}`,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  };
}

export function calculateMatchScore(
  opportunity: Opportunity,
  profile: UserProfile
): MatchScoreResult {
  const eligibility = evaluateEligibility(opportunity, profile);
  const factors: MatchFactorBreakdown[] = [];
  const whyItMatches: string[] = [];
  const keyHighlights: string[] = [];

  // Factor 1: Hard Eligibility (Max 35 pts)
  let eligibilityPoints = 0;
  if (eligibility.eligible) {
    eligibilityPoints = 35;
    whyItMatches.push('Passed all mandatory age, citizenship, and core eligibility criteria.');
  } else {
    // Partial points if only 1 soft failure
    const hardFailures = eligibility.failedRequirements.filter((f) => !f.isSoftConstraint);
    if (hardFailures.length === 0) {
      eligibilityPoints = 25;
    } else {
      eligibilityPoints = 5;
    }
  }
  factors.push({
    name: 'Eligibility Verification',
    category: 'Eligibility',
    score: eligibilityPoints,
    maxScore: 35,
    description: eligibility.eligible
      ? 'Fully meets all hard criteria requirements.'
      : 'Has one or more eligibility criteria constraints.',
  });

  // Factor 2: Education Level & Year Standing (Max 15 pts)
  let eduPoints = 0;
  if (
    !opportunity.educationRequirements ||
    opportunity.educationRequirements.includes('Any') ||
    opportunity.educationRequirements.includes(profile.educationLevel)
  ) {
    eduPoints += 10;
  }
  if (
    !opportunity.yearRequirements ||
    opportunity.yearRequirements.length === 0 ||
    opportunity.yearRequirements.includes(profile.year)
  ) {
    eduPoints += 5;
    whyItMatches.push(`Targeted for Year ${profile.year} ${profile.educationLevel} students.`);
  }
  factors.push({
    name: 'Academic Level & Standing',
    category: 'Profile',
    score: eduPoints,
    maxScore: 15,
    description: `Evaluates alignment with ${profile.educationLevel} Year ${profile.year}.`,
  });

  // Factor 3: Discipline & Field Synergy (Max 15 pts)
  let fieldPoints = 0;
  const userFieldLower = profile.field.toLowerCase();
  if (
    !opportunity.fieldRequirements ||
    opportunity.fieldRequirements.includes('All Fields')
  ) {
    fieldPoints = 12;
    whyItMatches.push('Open to all academic disciplines including your field.');
  } else {
    const fieldMatch = opportunity.fieldRequirements.some((f) => {
      const fLower = f.toLowerCase();
      return (
        fLower === userFieldLower ||
        fLower.includes(userFieldLower) ||
        userFieldLower.includes(fLower) ||
        (userFieldLower.includes('psych') && (fLower.includes('social') || fLower.includes('cognitive') || fLower.includes('behavioral'))) ||
        (userFieldLower.includes('computer') && (fLower.includes('data') || fLower.includes('tech')))
      );
    });
    if (fieldMatch) {
      fieldPoints = 15;
      whyItMatches.push(`Direct subject match with your specialization in ${profile.field}.`);
    } else {
      fieldPoints = 4;
    }
  }
  factors.push({
    name: 'Field & Subject Synergy',
    category: 'Profile',
    score: fieldPoints,
    maxScore: 15,
    description: `Match between ${profile.field} and opportunity requirements.`,
  });

  // Factor 4: Skills & Experience Alignment (Max 10 pts)
  let skillsPoints = 0;
  if (opportunity.skills && opportunity.skills.length > 0) {
    const userSkillsLower = profile.skills.map((s) => s.toLowerCase());
    const matchedSkills = opportunity.skills.filter((reqSkill) =>
      userSkillsLower.some((userSkill) =>
        userSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(userSkill)
      )
    );
    if (matchedSkills.length > 0) {
      skillsPoints = Math.min(10, 5 + matchedSkills.length * 2.5);
      whyItMatches.push(`Leverages your skills in ${matchedSkills.join(', ')}.`);
    } else {
      skillsPoints = 4;
    }
  } else {
    skillsPoints = 8; // generic skill baseline
  }
  factors.push({
    name: 'Skills & Experience Fit',
    category: 'Profile',
    score: Math.round(skillsPoints),
    maxScore: 10,
    description: 'Assesses practical competencies and stated skills.',
  });

  // Factor 5: Strategic Goal Alignment (Max 15 pts)
  let goalPoints = 0;
  const userGoals = profile.goals.map((g) => g.toLowerCase());
  const oppCategoryLower = opportunity.category.toLowerCase();
  const oppDescLower = (opportunity.title + ' ' + opportunity.description).toLowerCase();

  let matchedGoalReasons: string[] = [];

  if (userGoals.some((g) => g.includes('study abroad') || g.includes('international'))) {
    if (opportunity.worldwide || opportunity.country !== profile.country || opportunity.category === 'Exchanges') {
      goalPoints += 6;
      matchedGoalReasons.push('Directly supports your goal of international study & exchange');
    }
  }

  if (userGoals.some((g) => g.includes('research') || g.includes('publish'))) {
    if (oppCategoryLower.includes('research') || oppDescLower.includes('research') || oppDescLower.includes('lab') || oppDescLower.includes('paper')) {
      goalPoints += 5;
      matchedGoalReasons.push('Accelerates your research experience and publishing trajectory');
    }
  }

  if (userGoals.some((g) => g.includes('cv') || g.includes('leadership') || g.includes('funding'))) {
    if (oppCategoryLower.includes('fellowship') || oppCategoryLower.includes('scholarship') || oppCategoryLower.includes('leadership') || oppCategoryLower.includes('grant')) {
      goalPoints += 4;
      matchedGoalReasons.push('High-prestige credential for your academic and leadership CV');
    }
  }

  if (goalPoints === 0) {
    goalPoints = 6;
  }
  goalPoints = Math.min(15, goalPoints);

  matchedGoalReasons.forEach((r) => whyItMatches.push(r));

  factors.push({
    name: 'Strategic Goal Alignment',
    category: 'Goal',
    score: goalPoints,
    maxScore: 15,
    description: 'Evaluates direct contribution to your stated long-term goals.',
  });

  // Factor 6: Funding & Budget Compatibility (Max 5 pts)
  let fundingPoints = 0;
  if (opportunity.funding === 'fully_funded' || opportunity.funding === 'paid') {
    fundingPoints = 5;
    keyHighlights.push('100% Fully Funded / Paid');
  } else if (opportunity.funding === 'prize') {
    fundingPoints = 4;
    keyHighlights.push(`Prize Grant: ${opportunity.prize ?? 'Awards Available'}`);
  } else if (opportunity.funding === 'partially_funded') {
    fundingPoints = profile.budget > 500 ? 4 : 2;
  } else {
    fundingPoints = profile.budget > 1000 ? 3 : 1;
  }

  if (opportunity.travelSupport) {
    keyHighlights.push('Travel & Flights Covered');
  }
  if (opportunity.accommodationSupport) {
    keyHighlights.push('Accommodation Provided');
  }
  if (opportunity.applicationFee === 0) {
    keyHighlights.push('No Application Fee ($0)');
  }

  factors.push({
    name: 'Funding & Budget Match',
    category: 'Funding',
    score: fundingPoints,
    maxScore: 5,
    description: `Match with your $${profile.budget} budget and ${profile.fundingRequirement} requirement.`,
  });

  // Factor 7: Location & Modality (Max 5 pts)
  let locPoints = 0;
  if (opportunity.modality === 'online' || opportunity.worldwide) {
    locPoints = 5;
  } else if (profile.desiredCountries.includes('Worldwide') || profile.desiredCountries.some((c) => c.toLowerCase() === opportunity.country.toLowerCase())) {
    locPoints = 5;
  } else {
    locPoints = 3;
  }
  factors.push({
    name: 'Location & Modality Preference',
    category: 'Location',
    score: locPoints,
    maxScore: 5,
    description: `Alignment with ${opportunity.modality} modality in ${opportunity.country}.`,
  });

  // Total Score (0 - 100)
  const totalRaw = factors.reduce((sum, f) => sum + f.score, 0);
  const totalScore = Math.max(0, Math.min(100, Math.round(totalRaw)));

  // Generate match summary
  let matchSummary = '';
  if (totalScore >= 85 && eligibility.eligible) {
    matchSummary = 'Exceptional Match — Strong alignment across eligibility, academic discipline, and target goals.';
  } else if (totalScore >= 70 && eligibility.eligible) {
    matchSummary = 'Strong Match — High compatibility with profile parameters and background.';
  } else if (eligibility.eligible) {
    matchSummary = 'Moderate Match — Eligible, with moderate overlap on stated preferences.';
  } else {
    matchSummary = 'Potential Mismatch — Review watchouts regarding eligibility criteria constraints.';
  }

  return {
    totalScore,
    isEligible: eligibility.eligible,
    eligibility,
    factors,
    matchSummary,
    whyItMatches,
    keyHighlights,
  };
}
