import { Category, FundingType } from '../types';

export interface DiscoverySignals {
  fundingTypes: FundingType[];
  categories: Category[];
  searchTerms: string[];
  worldwideOnly: boolean;
  freeApplicationOnly: boolean;
  noMajorRestriction: boolean;
  preferredCountries: string[];
  summary: string;
  hardEligibilityGuard: boolean;
}

export interface DiscoveryProvider {
  interpret: (prompt: string) => DiscoverySignals;
}

const FUNDING_MAP: Record<string, FundingType> = {
  full: 'fully_funded',
  fully: 'fully_funded',
  funded: 'fully_funded',
  scholarship: 'fully_funded',
  stipend: 'paid',
  paid: 'paid',
  prize: 'prize',
};

const CATEGORY_MAP: Record<string, Category> = {
  scholarship: 'Scholarships',
  scholarships: 'Scholarships',
  fellowship: 'Fellowships',
  fellowships: 'Fellowships',
  grant: 'Grants',
  grants: 'Grants',
  research: 'Research',
  internship: 'Internships',
  internships: 'Internships',
  competition: 'Competitions',
  competitions: 'Competitions',
  hackathon: 'Hackathons',
  hackathons: 'Hackathons',
  exchange: 'Exchanges',
  exchanges: 'Exchanges',
  conference: 'Conferences',
  conferences: 'Conferences',
  startup: 'Entrepreneurship',
  entrepreneurship: 'Entrepreneurship',
};

const COUNTRY_HINTS = [
  'United States',
  'United Kingdom',
  'Germany',
  'Canada',
  'Australia',
  'Japan',
  'Singapore',
  'Switzerland',
  'France',
  'Netherlands',
  'Worldwide',
];

export const createDiscoveryProvider = (): DiscoveryProvider => ({
  interpret(prompt: string): DiscoverySignals {
    const normalized = prompt.toLowerCase();
    const fundingTypes: FundingType[] = [];
    const categories: Category[] = [];
    const searchTerms: string[] = [];
    const preferredCountries: string[] = [];

    if (/fully funded|full funding|scholarship/i.test(normalized)) {
      fundingTypes.push('fully_funded');
    }
    if (/paid|stipend|salary/i.test(normalized)) {
      fundingTypes.push('paid');
    }
    if (/free application|no fee|no application fee/i.test(normalized)) {
      // handled as a regular flag below
    }

    Object.entries(CATEGORY_MAP).forEach(([keyword, category]) => {
      if (normalized.includes(keyword)) {
        categories.push(category);
        searchTerms.push(keyword);
      }
    });

    const mentionWorldwide = /worldwide|global|international|remote|online/i.test(normalized);
    const freeApplicationOnly = /free application|no fee|no application fee|no cost/i.test(normalized);
    const noMajorRestriction = /any major|all majors|open to all|no major restriction/i.test(normalized);

    COUNTRY_HINTS.forEach((country) => {
      if (normalized.includes(country.toLowerCase())) {
        preferredCountries.push(country);
      }
    });

    const summary = [
      'Pathlight inferred opportunity preferences from your brief.',
      categories.length ? `Focus on ${categories.slice(0, 2).join(' and ')} opportunities.` : 'Search broadly across verified student opportunities.',
      fundingTypes.length ? `Prioritize ${fundingTypes.join(' and ')} options.` : 'Keep the list mixed across funding types.',
    ].join(' ');

    return {
      fundingTypes: Array.from(new Set(fundingTypes)),
      categories: Array.from(new Set(categories)),
      searchTerms: Array.from(new Set(searchTerms)),
      worldwideOnly: mentionWorldwide,
      freeApplicationOnly,
      noMajorRestriction,
      preferredCountries,
      summary,
      hardEligibilityGuard: false,
    };
  },
});
