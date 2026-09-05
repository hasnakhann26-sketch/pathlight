import { Category } from '../types';

const ALLOWED_CATEGORIES: Category[] = [
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

export function normalizeOpportunityCategory(rawCategory: string | undefined, title = '', description = '', organization = ''): Category {
  const value = (rawCategory || '').trim();
  if (ALLOWED_CATEGORIES.includes(value as Category)) return value as Category;

  const text = `${value} ${title} ${description} ${organization}`.toLowerCase();
  if (/scholarship|tuition waiver|financial aid|bursary/.test(text)) return 'Scholarships';
  if (/fellowship/.test(text)) return 'Fellowships';
  if (/research|lab|phd|scientist|thesis/.test(text)) return 'Research';
  if (/exchange|study abroad|cultural exchange|travel program/.test(text)) return 'Exchanges';
  if (/grant|funding|seed fund|microgrant/.test(text)) return 'Grants';
  if (/hackathon|code sprint|build challenge/.test(text)) return 'Hackathons';
  if (/internship|intern\b/.test(text)) return 'Internships';
  if (/\bmun\b|model united/.test(text)) return 'MUN';
  if (/conference|summit|forum|congress|symposium/.test(text)) return 'Conferences';
  if (/competition|contest|challenge|essay|olympiad|award|prize|quiz/.test(text)) return 'Competitions';

  return 'Competitions';
}
