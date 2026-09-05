import { Opportunity, UserProfile, Category } from '../types';
import { deduplicateOpportunities } from '../engine/deduplication';

export interface AggregatorSource {
  name: string;
  url: string;
  tier: 1 | 2 | 3;
  format: 'rss' | 'html';
}
export interface AggregatorSourceStatus {
  name: string;
  tier: 1 | 2 | 3;
  ok: boolean;
  itemCount: number;
}

export const AGGREGATOR_SOURCES: AggregatorSource[] = [
  { name: 'Opportunity Desk', url: 'https://opportunitydesk.org/feed/', tier: 1, format: 'rss' },
  { name: 'Youth Opportunities', url: 'https://www.youthop.com/feed', tier: 1, format: 'rss' },
  { name: 'OYA Opportunities', url: 'https://oyaop.com/feed/', tier: 1, format: 'rss' },
  { name: 'Opportunities for Youth', url: 'https://opportunitiesforyouth.org/feed/', tier: 1, format: 'rss' },
  { name: 'Opportunities Radar', url: 'https://opportunitiesradar.com/feed/', tier: 1, format: 'rss' },
  { name: 'Funds for NGOs', url: 'https://www2.fundsforngos.org/feed/', tier: 2, format: 'rss' },
  { name: 'Global Grants Hub', url: 'https://globalgrantshub.org/feed/', tier: 2, format: 'rss' },
  { name: 'Student Competitions', url: 'https://studentcompetitions.com/rss', tier: 2, format: 'rss' },
  { name: 'Opportunities Corners', url: 'https://opportunitiescorners.com/feed/', tier: 2, format: 'rss' },
  { name: 'Best Delegate', url: 'https://bestdelegate.com/feed/', tier: 2, format: 'rss' },
  { name: 'International Mathematical Olympiad', url: 'https://imo-official.org', tier: 3, format: 'html' },
  { name: 'International Physics Olympiad', url: 'https://www.ipho-new.org', tier: 3, format: 'html' },
  { name: 'International Chemistry Olympiad', url: 'https://icho.events', tier: 3, format: 'html' },
  { name: 'myMUN Conferences', url: 'https://mymun.com/conferences', tier: 3, format: 'html' },
  { name: 'Best Delegate Conferences', url: 'https://bestdelegate.com/model-un-conferences/', tier: 3, format: 'html' },
];

const CACHE_KEY = 'pathlight_aggregated_opportunities_v1';
const PROXY = 'https://api.allorigins.win/raw?url=';
const MAX_ITEMS_PER_SOURCE = 40;

function cleanText(value: string | null | undefined) {
  return (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hash(value: string) {
  let result = 0;
  for (let i = 0; i < value.length; i += 1) result = (result << 5) - result + value.charCodeAt(i) | 0;
  return Math.abs(result).toString(36);
}

function inferCategory(text: string): Category {
  const value = text.toLowerCase();
  if (/\bmun\b|model united nations|delegate conference/.test(value)) return 'MUN';
  if (/essay|writing|poetry|storytelling|article|olympiad|quiz|mathematical|physics competition|chemistry competition/.test(value)) return 'Competitions';
  if (/scholarship|tuition/.test(value)) return 'Scholarships';
  if (/fellowship/.test(value)) return 'Fellowships';
  if (/grant|funding|award/.test(value)) return 'Grants';
  if (/exchange|travel|summer school|study abroad/.test(value)) return 'Exchanges';
  if (/research|lab|scientist/.test(value)) return 'Research';
  if (/internship|intern/.test(value)) return 'Internships';
  if (/conference|summit|forum|symposium/.test(value)) return 'Conferences';
  if (/hackathon|competition|contest|challenge|prize/.test(value)) return 'Hackathons';
  return 'Competitions';
}

function extractDeadline(text: string) {
  const iso = text.match(/\b20\d{2}[-/]\d{1,2}[-/]\d{1,2}\b/);
  if (iso) return iso[0].replace(/\//g, '-');
  const named = text.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,|\s)\s*20\d{2}\b/i);
  if (!named) return undefined;
  const parsed = new Date(named[0].replace(/(\d+)(st|nd|rd|th)/i, '$1'));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

function inferAgeRange(text: string) {
  const match = text.match(/\b(?:ages?\s*)?(\d{2})\s*(?:to|-|–)\s*(\d{2})\b/i);
  if (match) return { minAge: Number(match[1]), maxAge: Number(match[2]) };
  const min = text.match(/\b(?:age|aged)\s*(?:of\s*)?(\d{2})\s*(?:or older|\+|and above)\b/i);
  if (min) return { minAge: Number(min[1]) };
  return {};
}

function inferFieldRequirements(text: string) {
  const value = text.toLowerCase();
  if (/all majors|all fields|any discipline|any field/.test(value)) return undefined;
  const fields = ['psychology', 'computer science', 'engineering', 'business', 'economics', 'law', 'medicine', 'health', 'arts', 'humanities', 'social science', 'mathematics', 'physics', 'chemistry', 'biology'];
  const matches = fields.filter((field) => value.includes(field));
  return matches.length ? matches : undefined;
}

function makeOpportunity(source: AggregatorSource, title: string, description: string, url: string, dateText = ''): Opportunity | null {
  const normalizedTitle = cleanText(title);
  if (!normalizedTitle || normalizedTitle.length < 12) return null;
  const body = cleanText(`${normalizedTitle} ${description} ${dateText}`);
  const deadline = extractDeadline(body);
  const age = inferAgeRange(body);
  const fieldRequirements = inferFieldRequirements(body);
  const worldwide = /worldwide|international|all nationalit|global|any country|open to everyone/i.test(body);
  const category = inferCategory(body);
  const today = new Date().toISOString().slice(0, 10);
  return {
    canonicalOpportunityId: `agg_${hash(`${normalizedTitle.toLowerCase()}|${source.name.toLowerCase()}`)}`,
    title: normalizedTitle,
    organization: source.name,
    category,
    description: cleanText(description).slice(0, 150) || `Opportunity from ${source.name}.`,
    officialSourceUrl: url,
    applicationUrl: url,
    country: worldwide ? 'Worldwide' : 'Not specified',
    worldwide,
    modality: 'online',
    ...age,
    fieldRequirements,
    deadline,
    funding: /fully funded|100% funded|travel support/i.test(body) ? 'fully_funded' : /prize|cash award/i.test(body) ? 'prize' : 'self_funded',
    applicationFee: 0,
    verificationStatus: 'pending',
    lastVerified: today,
    sourceCount: 1,
    sources: [{ sourceName: source.name, sourceType: 'public_feed', sourceUrl: source.url, retrievedAt: today }],
  };
}

function parseRss(xml: string, source: AggregatorSource) {
  const document = new DOMParser().parseFromString(xml, 'text/xml');
  return Array.from(document.querySelectorAll('item, entry')).slice(0, MAX_ITEMS_PER_SOURCE).map((item) => {
    const title = item.querySelector('title')?.textContent || '';
    const linkNode = item.querySelector('link');
    const url = linkNode?.getAttribute('href') || linkNode?.textContent || source.url;
    const description = item.querySelector('description, summary, content\\:encoded')?.textContent || '';
    const date = item.querySelector('pubDate, published, updated')?.textContent || '';
    return makeOpportunity(source, title, description, url.trim(), date);
  }).filter(Boolean) as Opportunity[];
}

function parseHtml(html: string, source: AggregatorSource) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(document.querySelectorAll('a[href]')).slice(0, MAX_ITEMS_PER_SOURCE).map((anchor) => {
    const title = cleanText(anchor.textContent);
    const url = new URL(anchor.getAttribute('href') || source.url, source.url).toString();
    return makeOpportunity(source, title, '', url);
  }).filter(Boolean) as Opportunity[];
}

async function fetchSource(source: AggregatorSource) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);
  try {
    const response = await Promise.race([
      fetch(`${PROXY}${encodeURIComponent(source.url)}`, { signal: controller.signal }),
      new Promise<Response>((resolve) => window.setTimeout(() => resolve(new Response('', { status: 504 })), 5500)),
    ]);
    if (!response.ok) return { source, opportunities: [], ok: false };
    const body = await response.text();
    const opportunities = source.format === 'rss' ? parseRss(body, source) : parseHtml(body, source);
    return { source, opportunities, ok: true };
  } catch {
    return { source, opportunities: [], ok: false };
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchAggregatedOpportunities() {
  const batches = await Promise.all(AGGREGATOR_SOURCES.map((source) => fetchSource(source)));
  const opportunities = deduplicateOpportunities(batches.flatMap((batch) => batch.opportunities)).filter((opportunity) => {
    if (!opportunity.deadline) return true;
    return new Date(opportunity.deadline).getTime() >= Date.now();
  });
  const updatedAt = new Date().toISOString();
  if (opportunities.length > 0) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(opportunities));
    } catch {
      // Cache failure should never block discovery.
    }
  }
  return {
    opportunities,
    updatedAt,
    sourceStatuses: batches.map(({ source, opportunities: items, ok }) => ({ name: source.name, tier: source.tier, ok, itemCount: items.length })),
  };
}

export function getCachedAggregatedOpportunities(): Opportunity[] {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

export function isOpportunityForProfile(opportunity: Opportunity, profile: UserProfile) {
  if (opportunity.minAge !== undefined && profile.age < opportunity.minAge) return false;
  if (opportunity.maxAge !== undefined && profile.age > opportunity.maxAge) return false;
  const text = `${opportunity.title} ${opportunity.description} ${opportunity.country}`.toLowerCase();
  const countryMatches = opportunity.worldwide || !opportunity.citizenshipRequirements?.length || opportunity.citizenshipRequirements.some((country) => text.includes(country.toLowerCase()) || country.toLowerCase() === profile.citizenship.toLowerCase()) || text.includes(profile.country.toLowerCase());
  if (!countryMatches) return false;
  if (!opportunity.fieldRequirements?.length || opportunity.fieldRequirements.includes('All Fields')) return true;
  const field = profile.field.toLowerCase();
  return opportunity.fieldRequirements.some((required) => field.includes(required.toLowerCase()) || required.toLowerCase().includes(field));
}