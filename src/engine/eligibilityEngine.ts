import { Opportunity, UserProfile, EligibilityResult, RequirementEvaluation } from '../types';

export function evaluateEligibility(
  opportunity: Opportunity,
  profile: UserProfile
): EligibilityResult {
  const matchedRequirements: RequirementEvaluation[] = [];
  const failedRequirements: RequirementEvaluation[] = [];
  const reasons: string[] = [];
  const watchouts: string[] = [];

  let hardCriteriaPassed = true;
  let totalHardCriteria = 0;
  let passedHardCriteria = 0;

  // 1. Age Check (Hard Constraint)
  if (opportunity.minAge !== undefined || opportunity.maxAge !== undefined) {
    totalHardCriteria++;
    const min = opportunity.minAge ?? 0;
    const max = opportunity.maxAge ?? 150;
    const ageOk = profile.age >= min && profile.age <= max;

    const evalObj: RequirementEvaluation = {
      criterion: 'Age Requirement',
      userValue: `${profile.age} years old`,
      requiredValue:
        opportunity.minAge && opportunity.maxAge
          ? `${opportunity.minAge} - ${opportunity.maxAge} years`
          : opportunity.minAge
          ? `Min ${opportunity.minAge} years`
          : `Max ${opportunity.maxAge} years`,
      passed: ageOk,
    };

    if (ageOk) {
      passedHardCriteria++;
      matchedRequirements.push(evalObj);
      reasons.push(`Your age (${profile.age}) meets the required range.`);
    } else {
      hardCriteriaPassed = false;
      failedRequirements.push(evalObj);
      watchouts.push(`Age restriction: requires ${evalObj.requiredValue}, you are ${profile.age}.`);
    }
  }

  // 2. Citizenship & Country Requirements (Hard Constraint if specified)
  if (
    opportunity.citizenshipRequirements &&
    opportunity.citizenshipRequirements.length > 0 &&
    !opportunity.citizenshipRequirements.includes('Worldwide') &&
    !opportunity.citizenshipRequirements.includes('Any') &&
    !opportunity.citizenshipRequirements.includes('All Nationalities')
  ) {
    totalHardCriteria++;
    const userCitizenshipLower = profile.citizenship.toLowerCase().trim();
    const userCountryLower = profile.country.toLowerCase().trim();

    const matchesDirect = opportunity.citizenshipRequirements.some((c) => {
      const cLower = c.toLowerCase();
      return (
        cLower === userCitizenshipLower ||
        cLower === userCountryLower ||
        (cLower.includes('global south') && ['pakistan', 'india', 'kenya', 'nigeria', 'bangladesh', 'ghana', 'vietnam', 'philippines', 'egypt', 'brazil', 'indonesia', 'colombia'].includes(userCitizenshipLower)) ||
        (cLower.includes('developing') && ['pakistan', 'india', 'kenya', 'nigeria', 'bangladesh', 'vietnam', 'egypt', 'ghana', 'philippines'].includes(userCitizenshipLower)) ||
        cLower.includes('partner')
      );
    });

    const evalObj: RequirementEvaluation = {
      criterion: 'Citizenship / Target Countries',
      userValue: profile.citizenship,
      requiredValue: opportunity.citizenshipRequirements.join(', '),
      passed: matchesDirect,
    };

    if (matchesDirect) {
      passedHardCriteria++;
      matchedRequirements.push(evalObj);
      reasons.push(`Citizenship (${profile.citizenship}) is eligible for this program.`);
    } else {
      hardCriteriaPassed = false;
      failedRequirements.push(evalObj);
      watchouts.push(`Citizenship restriction: Open to [${opportunity.citizenshipRequirements.join(', ')}].`);
    }
  }

  // 3. Education Level (Hard Constraint)
  if (
    opportunity.educationRequirements &&
    opportunity.educationRequirements.length > 0 &&
    !opportunity.educationRequirements.includes('Any')
  ) {
    totalHardCriteria++;
    const userLevel = profile.educationLevel;
    const isLevelMatch = opportunity.educationRequirements.includes(userLevel);

    const evalObj: RequirementEvaluation = {
      criterion: 'Education Level',
      userValue: userLevel,
      requiredValue: opportunity.educationRequirements.join(' or '),
      passed: isLevelMatch,
    };

    if (isLevelMatch) {
      passedHardCriteria++;
      matchedRequirements.push(evalObj);
      reasons.push(`Education level (${userLevel}) directly matches program requirements.`);
    } else {
      hardCriteriaPassed = false;
      failedRequirements.push(evalObj);
      watchouts.push(`Education requirement not met: Requires ${evalObj.requiredValue}, your profile is ${userLevel}.`);
    }
  }

  // 4. Academic Year / Standing (Hard or soft depending on level)
  if (opportunity.yearRequirements && opportunity.yearRequirements.length > 0) {
    totalHardCriteria++;
    const isYearMatch = opportunity.yearRequirements.includes(profile.year);

    const evalObj: RequirementEvaluation = {
      criterion: 'Academic Year / Semester Standing',
      userValue: `Year ${profile.year}`,
      requiredValue: `Year ${opportunity.yearRequirements.join(', ')}`,
      passed: isYearMatch,
    };

    if (isYearMatch) {
      passedHardCriteria++;
      matchedRequirements.push(evalObj);
      reasons.push(`Enrolled in eligible academic year (Year ${profile.year}).`);
    } else {
      hardCriteriaPassed = false;
      failedRequirements.push(evalObj);
      watchouts.push(`Year standing mismatch: Program targets Year ${opportunity.yearRequirements.join(', ')}.`);
    }
  }

  // 5. Degree Requirement
  if (
    opportunity.degreeRequirements &&
    opportunity.degreeRequirements.length > 0 &&
    !opportunity.degreeRequirements.includes('Any')
  ) {
    const userDegree = profile.degree.toUpperCase().trim();
    const degreeMatch = opportunity.degreeRequirements.some((req) => {
      const rUpper = req.toUpperCase();
      return rUpper.includes(userDegree) || userDegree.includes(rUpper) || rUpper.includes('ANY');
    });

    const evalObj: RequirementEvaluation = {
      criterion: 'Degree Track',
      userValue: profile.degree,
      requiredValue: opportunity.degreeRequirements.join(', '),
      passed: degreeMatch,
      isSoftConstraint: true,
    };

    if (degreeMatch) {
      matchedRequirements.push(evalObj);
      reasons.push(`Degree track (${profile.degree}) aligns with accepted degrees.`);
    } else {
      failedRequirements.push(evalObj);
      watchouts.push(`Target degree preference: ${opportunity.degreeRequirements.join(', ')}.`);
    }
  }

  // 6. Field of Study / Discipline
  if (
    opportunity.fieldRequirements &&
    opportunity.fieldRequirements.length > 0 &&
    !opportunity.fieldRequirements.includes('All Fields')
  ) {
    const userField = profile.field.toLowerCase();
    const fieldMatch = opportunity.fieldRequirements.some((f) => {
      const fLower = f.toLowerCase();
      return (
        fLower === userField ||
        fLower.includes(userField) ||
        userField.includes(fLower) ||
        (userField.includes('psych') && (fLower.includes('social') || fLower.includes('cognitive') || fLower.includes('human') || fLower.includes('behavioral'))) ||
        (userField.includes('computer') && (fLower.includes('data') || fLower.includes('tech') || fLower.includes('engineering')))
      );
    });

    const evalObj: RequirementEvaluation = {
      criterion: 'Field of Study',
      userValue: profile.field,
      requiredValue: opportunity.fieldRequirements.join(', '),
      passed: fieldMatch,
      isSoftConstraint: false,
    };

    if (fieldMatch) {
      matchedRequirements.push(evalObj);
      reasons.push(`Field of study (${profile.field}) is specifically accepted.`);
    } else {
      // For some opportunities, field is an explicit filter
      failedRequirements.push(evalObj);
      watchouts.push(`Field restriction: Specifically seeks candidates in ${opportunity.fieldRequirements.join(', ')}.`);
    }
  } else {
    matchedRequirements.push({
      criterion: 'Field of Study',
      userValue: profile.field,
      requiredValue: 'Open to All Disciplines',
      passed: true,
    });
    reasons.push('Open to all academic disciplines.');
  }

  // 7. Funding & Budget Compatibility Check
  const isBudgetSufficient =
    opportunity.funding === 'fully_funded' ||
    opportunity.funding === 'paid' ||
    opportunity.funding === 'prize' ||
    profile.budget >= 1000 ||
    opportunity.applicationFee === 0;

  if (profile.fundingRequirement === 'fully_funded_only') {
    const isFunded =
      opportunity.funding === 'fully_funded' ||
      opportunity.funding === 'paid' ||
      (opportunity.funding === 'prize' && opportunity.prize !== undefined);

    const evalObj: RequirementEvaluation = {
      criterion: 'Funding Requirement (User requires Full Funding)',
      userValue: `Budget: $${profile.budget}, requires full funding`,
      requiredValue: 'Fully Funded or Paid Stipend',
      passed: isFunded,
    };

    if (isFunded) {
      matchedRequirements.push(evalObj);
      reasons.push(`Funding matches: ${opportunity.funding.replace('_', ' ')} with $0 required user budget.`);
    } else {
      failedRequirements.push(evalObj);
      watchouts.push(`Self-funding / partial funding may be required for this opportunity.`);
    }
  }

  // 8. Modality Alignment
  if (profile.modalityPreference !== 'any') {
    const modalityMatch =
      opportunity.modality === profile.modalityPreference ||
      opportunity.modality === 'hybrid';

    const evalObj: RequirementEvaluation = {
      criterion: 'Modality Format',
      userValue: profile.modalityPreference,
      requiredValue: opportunity.modality,
      passed: modalityMatch,
      isSoftConstraint: true,
    };

    if (modalityMatch) {
      matchedRequirements.push(evalObj);
    } else {
      failedRequirements.push(evalObj);
      watchouts.push(`Format is ${opportunity.modality}; your preference is ${profile.modalityPreference}.`);
    }
  }

  // Calculate deterministic score
  // If no hard criteria existed (open opportunity), base score is 100
  let calculatedScore = 100;
  if (totalHardCriteria > 0) {
    calculatedScore = Math.round((passedHardCriteria / totalHardCriteria) * 80);
    // Add soft bonuses for matching fields and degree
    if (matchedRequirements.some((r) => r.criterion === 'Field of Study' && r.passed)) {
      calculatedScore += 10;
    }
    if (matchedRequirements.some((r) => r.criterion === 'Degree Track' && r.passed)) {
      calculatedScore += 10;
    }
  }

  // Cap score to 100 and floor to 0
  calculatedScore = Math.max(0, Math.min(100, calculatedScore));

  const eligible = hardCriteriaPassed && (failedRequirements.length === 0 || failedRequirements.every((f) => f.isSoftConstraint));

  return {
    eligible,
    eligibilityScore: calculatedScore,
    reasons,
    watchouts,
    matchedRequirements,
    failedRequirements,
  };
}
