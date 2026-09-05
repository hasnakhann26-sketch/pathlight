import { Category } from '../types';

export const REQUIRED_CATEGORIES: Category[] = [
  'Scholarships',
  'Fellowships',
  'Research',
  'Exchanges',
  'Grants',
  'Competitions',
  'Hackathons',
  'Internships',
  'Conferences',
  'MUN',
];

export function normalizeOpportunityCategory(rawCategory?: string, contextText = ''): Category {
  const value = `${rawCategory || ''} ${contextText}`.trim().toLowerCase();

  if (!value) return 'Competitions';
  if (value.includes('scholarship')) return 'Scholarships';
  if (value.includes('fellowship')) return 'Fellowships';
  if (value.includes('research') || value.includes('phd') || value.includes('lab') || value.includes('scientist')) return 'Research';
  if (value.includes('exchange') || value.includes('travel') || value.includes('study abroad')) return 'Exchanges';
  if (value.includes('grant') || value.includes('funding') || value.includes('fund ')) return 'Grants';
  if (value.includes('hackathon') || value.includes('coding') || value.includes('build')) return 'Hackathons';
  if (value.includes('internship') || value.includes('intern')) return 'Internships';
  if (value.includes('mun') || value.includes('model united')) return 'MUN';
  if (value.includes('conference') || value.includes('summit') || value.includes('forum') || value.includes('congress')) return 'Conferences';
  if (
    value.includes('competition') ||
    value.includes('contest') ||
    value.includes('award') ||
    value.includes('essay') ||
    value.includes('writing') ||
    value.includes('quiz') ||
    value.includes('olympiad') ||
    value.includes('prize')
  ) return 'Competitions';

  return 'Competitions';
}
