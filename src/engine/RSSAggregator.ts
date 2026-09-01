import { Category, Opportunity, UserProfile } from '../types';
import { deduplicateOpportunities } from './deduplication';

export type RSSSourceTier = 1 | 2 | 3;

export interface RSSSourceStatus {
  name: string;
  tier: RSSSourceTier;
  ok: boolean;
  itemCount: number;
}

export interface RSSAggregateResult {
  opportunities: Opportunity[];
  updatedAt: string;
  sourceStatuses: RSSSourceStatus[];
}

interface RSSFeedDefinition {
  name: string;
  url: string;
  tier: RSSSourceTier;
  format: 'rss' | 'html';
}

const CACHE_KEY = 'pathlight_rss_cache_v1';
const CACHE_TTL_MS_BY_TIER: Record<RSSSourceTier, number> = {
  1: 1000 * 60 * 60 * 6,
  2: 1000 * 60 * 60 * 12,
  3: 1000 * 60 * 60 * 24,
};
const PROXY_URL = 'https://api.allorigins.win/raw?url=';
const MAX_ITEMS_PER_SOURCE = 25;

const FEEDS: RSSFeedDefinition[] = [
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

const INCLUDE_PATTERNS = [
  'scholarship',
  'fellowship',
  'grant',
  'funding',
  'global',
  'international',
  'worldwide',
  'olympiad',
  'research',
  'conference',
  'summit',
  'exchange',
  'travel',
  'competition',
  'hackathon',
  'mun',
  'model united nations',
  'essay',
  'writing',
  'internship',
  'summer school',
];

const EXCLUDE_PATTERNS = [
  'full-time job',
  'remote job',
  'software engineer',
  'security engineer',
  'data analyst role',
  'recruitment drive',
  'recruiting',
  'job opening',
  'vacancy',
  'employment',
  'paid internship',
  'salaried',
  'job alert',
];

function cleanText(value: string | null | undefined): string {
  return (value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function extractDeadline(text: string): string | undefined {
  const isoMatch = text.match(/\b20\d{2}[-/]\d{1,2}[-/]\d{1,2}\b/);
  if (isoMatch) return isoMatch[0].replace(/\//g, '-');

  const literalMatch = text.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,|\s)\s*20\d{2}\b/i);
  if (!literalMatch) return undefined;

  const parsed = new Date(literalMatch[0].replace(/(\d+)(st|nd|rd|th)/i, '$1'));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

function inferCategory(title: string, description: string): Category {
  const value = `${title} ${description}`.toLowerCase();

  if (/mun|model united nations|delegate conference/.test(value)) return 'MUN';
  if (/essay|writing|poetry|storytelling|article/.test(value)) return 'Essay / Writing';
  if (/olympiad|quiz|physics|chemistry|mathematical/.test(value)) return 'Quiz / Olympiad';
  if (/scholarship|tuition waiver|full scholarship/.test(value)) return 'Scholarship';
  if (/fellowship|research fellowship/.test(value)) return 'Fellowships';
  if (/grant|funding|award/.test(value)) return 'Grant';
  if (/exchange|travel|study abroad|summer school/.test(value)) return 'Travel / Exchange';
  if (/research|lab|scientist|project/.test(value)) return 'Research';
  if (/internship|intern/.test(value)) return 'Internships';
  if (/hackathon|challenge|contest|competition|prize/.test(value)) return 'Competition / Hackathon';
  if (/conference|summit|symposium|forum/.test(value)) return 'Conference / Summit';

  return 'Professional opportunities';
}

function inferFunding(text: string): Opportunity['funding'] {
  const value = text.toLowerCase();
  if (/fully funded|100% funded|travel support|stipend.*covered|tuition waiver/.test(value)) return 'fully_funded';
  if (/paid|salary|stipend|cash award/.test(value)) return 'paid';
  if (/prize|cash award|award/.test(value)) return 'prize';
  return 'self_funded';
}

function inferWorldwide(text: string): boolean {
  return /worldwide|international|global|open to all|all nationalities|any country|any nationality|online|remote/i.test(text);
}

function shouldIncludeOpportunity(opportunity: Opportunity): boolean {
  const text = `${opportunity.title} ${opportunity.description} ${opportunity.country}`.toLowerCase();

  const includesGoodTopic = INCLUDE_PATTERNS.some((pattern) => text.includes(pattern));
  const excludesBadTopic = EXCLUDE_PATTERNS.some((pattern) => text.includes(pattern));
  const isGood = opportunity.worldwide || includesGoodTopic;

  if (excludesBadTopic && !includesGoodTopic) return false;
  return isGood;
}

function normalizeOpportunity(feed: RSSFeedDefinition, rawTitle: string, rawDescription: string, rawUrl: string, dateText = ''): Opportunity | null {
  const title = cleanText(rawTitle);
  const description = cleanText(rawDescription);
  const url = rawUrl && rawUrl.trim() ? rawUrl : feed.url;

  if (!title || title.length < 12) return null;

  const fullText = `${title} ${description} ${dateText}`;
  const deadline = extractDeadline(fullText);
  const worldwide = inferWorldwide(fullText);
  const category = inferCategory(title, description);
  const today = new Date().toISOString();

  return {
    canonicalOpportunityId: `rss_${hashSeed(`${feed.name}|${title.toLowerCase()}`)}`,
    title,
    organization: feed.name,
    category,
    description: description || `Opportunity from ${feed.name}.`,
    officialSourceUrl: url,
    applicationUrl: url,
    country: worldwide ? 'Worldwide' : 'Not specified',
    worldwide,
    modality: 'online',
    deadline,
    funding: inferFunding(fullText),
    applicationFee: 0,
    verificationStatus: 'pending',
    lastVerified: today,
    sourceCount: 1,
    sources: [
      {
        sourceName: feed.name,
        sourceType: 'public_feed',
        sourceUrl: feed.url,
        retrievedAt: today,
      },
    ],
  };
}

function parseRss(xml: string, feed: RSSFeedDefinition): Opportunity[] {
  const document = new DOMParser().parseFromString(xml, 'text/xml');
  return Array.from(document.querySelectorAll('item, entry'))
    .slice(0, MAX_ITEMS_PER_SOURCE)
    .map((item) => {
      const title = item.querySelector('title')?.textContent || '';
      const linkNode = item.querySelector('link');
      const url = linkNode?.getAttribute('href') || linkNode?.textContent || feed.url;
      const description = item.querySelector('description, summary, content\:encoded')?.textContent || '';
      const date = item.querySelector('pubDate, published, updated')?.textContent || '';
      return normalizeOpportunity(feed, title, description, url, date);
    })
    .filter(Boolean) as Opportunity[];
}

function parseHtml(html: string, feed: RSSFeedDefinition): Opportunity[] {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(document.querySelectorAll('a[href]'))
    .slice(0, MAX_ITEMS_PER_SOURCE)
    .map((anchor) => {
      const title = cleanText(anchor.textContent);
      const href = anchor.getAttribute('href') || feed.url;
      const url = new URL(href, feed.url).toString();
      return normalizeOpportunity(feed, title, '', url);
    })
    .filter(Boolean) as Opportunity[];
}

async function fetchFeed(feed: RSSFeedDefinition): Promise<{ feed: RSSFeedDefinition; opportunities: Opportunity[]; ok: boolean }> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 6000);

  try {
    const response = await Promise.race([
      fetch(`${PROXY_URL}${encodeURIComponent(feed.url)}`, { signal: controller.signal }),
      new Promise<Response>((resolve) => {
        window.setTimeout(() => resolve(new Response('', { status: 504 })), 5500);
      }),
    ]);

    if (!response.ok) {
      return { feed, opportunities: [], ok: false };
    }

    const body = await response.text();
    const opportunities = feed.format === 'rss' ? parseRss(body, feed) : parseHtml(body, feed);
    return { feed, opportunities, ok: true };
  } catch {
    return { feed, opportunities: [], ok: false };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function readRSSCache(): Record<string, { updatedAt: string; opportunities: Opportunity[]; sourceStatuses: RSSSourceStatus[] }> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, { updatedAt: string; opportunities: Opportunity[]; sourceStatuses: RSSSourceStatus[] }>;
    }

    if (Array.isArray(parsed)) {
      return {
        all: {
          updatedAt: new Date().toISOString(),
          opportunities: parsed,
          sourceStatuses: [],
        },
      };
    }
  } catch {
    // Ignore malformed cache entries and refresh from live feeds.
  }

  return {};
}

export function getCachedRSSOpportunities(): Opportunity[] {
  const cache = readRSSCache();
  return Object.values(cache).flatMap((entry) => Array.isArray(entry?.opportunities) ? entry.opportunities : []);
}

export async function fetchRSSOpportunities(): Promise<RSSAggregateResult> {
  const batches = await Promise.all(FEEDS.map((feed) => fetchFeed(feed)));
  const flattened = batches.flatMap((batch) => batch.opportunities);
  const deduped = deduplicateOpportunities(flattened)
    .filter((opportunity) => shouldIncludeOpportunity(opportunity))
    .filter((opportunity) => !opportunity.deadline || new Date(opportunity.deadline).getTime() >= Date.now());

  const updatedAt = new Date().toISOString();
  const byTier = {
    1: deduped.filter((opp) => opp.sources.some((source) => FEEDS.find((feed) => feed.name === source.sourceName)?.tier === 1)),
    2: deduped.filter((opp) => opp.sources.some((source) => FEEDS.find((feed) => feed.name === source.sourceName)?.tier === 2)),
    3: deduped.filter((opp) => opp.sources.some((source) => FEEDS.find((feed) => feed.name === source.sourceName)?.tier === 3)),
  } as Record<1 | 2 | 3, Opportunity[]>;

  const nextCache = {
    tier1: { updatedAt, opportunities: byTier[1], sourceStatuses: batches.filter((batch) => batch.feed.tier === 1).map(({ feed, opportunities, ok }) => ({ name: feed.name, tier: feed.tier, ok, itemCount: opportunities.length })) },
    tier2: { updatedAt, opportunities: byTier[2], sourceStatuses: batches.filter((batch) => batch.feed.tier === 2).map(({ feed, opportunities, ok }) => ({ name: feed.name, tier: feed.tier, ok, itemCount: opportunities.length })) },
    tier3: { updatedAt, opportunities: byTier[3], sourceStatuses: batches.filter((batch) => batch.feed.tier === 3).map(({ feed, opportunities, ok }) => ({ name: feed.name, tier: feed.tier, ok, itemCount: opportunities.length })) },
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(nextCache));
  } catch {
    // Cache is best effort only.
  }

  return {
    opportunities: deduped,
    updatedAt,
    sourceStatuses: batches.map(({ feed, opportunities, ok }) => ({
      name: feed.name,
      tier: feed.tier,
      ok,
      itemCount: opportunities.length,
    })),
  };
}

export function shouldRecommendOpportunityForProfile(opportunity: Opportunity, profile: UserProfile): boolean {
  const text = `${opportunity.title} ${opportunity.description} ${opportunity.country}`.toLowerCase();

  if (opportunity.minAge !== undefined && profile.age < opportunity.minAge) return false;
  if (opportunity.maxAge !== undefined && profile.age > opportunity.maxAge) return false;

  const citizenshipMatch = !opportunity.citizenshipRequirements?.length ||
    opportunity.citizenshipRequirements.some((requirement) => {
      const value = requirement.toLowerCase();
      return value === 'any' || value.includes(profile.citizenship.toLowerCase()) || text.includes(value);
    });

  if (!citizenshipMatch) return false;

  if (!opportunity.fieldRequirements?.length || opportunity.fieldRequirements.some((rule) => rule.toLowerCase() === 'all fields')) {
    return true;
  }

  const fields = opportunity.fieldRequirements.map((field) => field.toLowerCase());
  return fields.some((field) => profile.field.toLowerCase().includes(field) || field.includes(profile.field.toLowerCase()));
}

export function getRSSCacheAgeMs(): number {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return Number.POSITIVE_INFINITY;
  try {
    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed) || parsed.length === 0) return Number.POSITIVE_INFINITY;
    const lastEntry = parsed[0];
    if (!lastEntry || !lastEntry.lastVerified) return Number.POSITIVE_INFINITY;
    return Date.now() - new Date(lastEntry.lastVerified).getTime();
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function shouldRefreshRSSCache(): boolean {
  const cache = readRSSCache();

  return [1, 2, 3].some((tier) => {
    const status = cache[`tier${tier}`];
    if (!status || !status.updatedAt) return true;
    const age = Date.now() - new Date(status.updatedAt).getTime();
    return age > CACHE_TTL_MS_BY_TIER[tier as RSSSourceTier];
  });
}
