import type { Category, FundingType } from '../types';

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
  interpret(input: string): DiscoverySignals;
}

const COUNTRY_HINTS = [
  'Pakistan',
  'India',
  'United States',
  'United Kingdom',
  'Germany',
  'Canada',
  'Australia',
  'Japan',
  'France',
  'South Korea',
  'Netherlands',
  'Sweden',
  'Singapore',
  'Malaysia',
  'Indonesia',
  'Brazil',
  'Kenya',
  'Nigeria',
  'Bangladesh',
  'Ghana',
  'Vietnam',
  'Philippines',
  'Egypt',
  'Colombia',
  'Rwanda',
  'South Africa',
  'Worldwide',
];

const PREFERRED_COUNTRY_MATCHERS = COUNTRY_HINTS.map((country) => ({
  country,
  regex: new RegExp(country.toLowerCase(), 'i'),
}));

function toSentence(parts: string[]) {
  if (parts.length === 0) return 'opportunities matching your description';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

export function extractDiscoverySignals(input: string): DiscoverySignals {
  const raw = (input ?? '').trim();
  const lower = raw.toLowerCase();

  const fundingTypes = new Set<FundingType>();
  const categories = new Set<Category>();
  const searchTerms = new Set<string>();
  const preferredCountries = new Set<string>();

  let worldwideOnly = false;
  let freeApplicationOnly = false;
  let noMajorRestriction = false;

  if (/(fully funded|fully-funded|funded for free|all expenses paid|no tuition|travel funded|for free|free travel|travel abroad for free|abroad for free)/i.test(lower)) {
    fundingTypes.add('fully_funded');
    searchTerms.add('fully funded');
  }

  if (/(paid stipend|paid opportunity|stipend|salary|cash award)/i.test(lower)) {
    fundingTypes.add('paid');
    searchTerms.add('paid');
  }

  if (/(no application fee|free application|application fee waived|no fee|fee-free|without fee|free to apply)/i.test(lower)) {
    freeApplicationOnly = true;
    searchTerms.add('no application fee');
  }

  if (/(abroad|international|overseas|travel abroad|outside my country|internationally|globally|travel overseas)/i.test(lower)) {
    worldwideOnly = true;
    searchTerms.add('international');
  }

  if (/(research|lab|scientific|research experience|faculty mentorship)/i.test(lower)) {
    categories.add('Research');
    searchTerms.add('research');
  }

  if (/(scholarship|tuition waiver|study grant)/i.test(lower)) {
    categories.add('Scholarships');
    searchTerms.add('scholarships');
  }

  if (/(fellowship|residency|mentor)/i.test(lower)) {
    categories.add('Fellowships');
    searchTerms.add('fellowships');
  }

  if (/(exchange|semester abroad|study abroad|student exchange)/i.test(lower)) {
    categories.add('Exchanges');
    searchTerms.add('exchange');
  }

  if (/(internship|training placement|work experience)/i.test(lower)) {
    categories.add('Internships');
    searchTerms.add('internships');
  }

  if (/(grant|seed funding|project funding)/i.test(lower)) {
    categories.add('Grants');
    searchTerms.add('grants');
  }

  if (/(conference|summit|symposium)/i.test(lower)) {
    categories.add('Conferences');
    searchTerms.add('conferences');
  }

  if (/(hackathon|competition|challenge|contest)/i.test(lower)) {
    categories.add('Hackathons');
    searchTerms.add('hackathons');
  }

  if (/(startup|entrepreneur|founder|venture|startup accelerator)/i.test(lower)) {
    categories.add('Entrepreneurship');
    searchTerms.add('entrepreneurship');
  }

  if (/(open to any major|no major requirement|no specific major|not major-specific|any field|all fields|without a specific major|outside psychology|outside my field|open to opportunities outside|outside psychology|outside my discipline|requires a specific major|major requirement|major-specific)/i.test(lower)) {
    noMajorRestriction = true;
    searchTerms.add('no major restriction');
  }

  for (const { country, regex } of PREFERRED_COUNTRY_MATCHERS) {
    if (regex.test(lower) && country !== 'Worldwide') {
      preferredCountries.add(country);
    }
  }

  const summaryParts: string[] = [];
  if (fundingTypes.has('fully_funded')) {
    summaryParts.push('fully funded international opportunities');
  } else if (fundingTypes.has('paid')) {
    summaryParts.push('paid opportunities');
  }

  if (categories.has('Research')) {
    summaryParts.push('research experience');
  }

  if (noMajorRestriction) {
    summaryParts.push('no major restriction');
  }

  if (summaryParts.length === 0) {
    if (worldwideOnly) summaryParts.push('international opportunities');
    if (categories.size > 0) summaryParts.push(...Array.from(categories).slice(0, 2).map((cat) => cat.toLowerCase()));
    if (searchTerms.size > 0) summaryParts.push(Array.from(searchTerms).slice(0, 2).join(' '));
  }

  const summary = `You told Pathlight you want ${toSentence(summaryParts)}.`;

  return {
    fundingTypes: Array.from(fundingTypes),
    categories: Array.from(categories),
    searchTerms: Array.from(searchTerms),
    worldwideOnly,
    freeApplicationOnly,
    noMajorRestriction,
    preferredCountries: Array.from(preferredCountries),
    summary,
    hardEligibilityGuard: true,
  };
}

export class LocalDiscoveryProvider implements DiscoveryProvider {
  interpret(input: string): DiscoverySignals {
    return extractDiscoverySignals(input);
  }
}

export function createDiscoveryProvider(): DiscoveryProvider {
  return new LocalDiscoveryProvider();
}
