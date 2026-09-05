import { Category, Opportunity, UserProfile } from '../types';
import { deduplicateOpportunities } from './deduplication';

export type RSSSourceTier = 1 | 2 | 3;

export interface RSSSourceStatus {
  name: string;
  url: string;
  tier: RSSSourceTier;
  ok: boolean;
  itemCount: number;
  lastChecked: string | null;
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
  alternateUrls?: string[];
}

const FEEDS: RSSFeedDefinition[] = [
  { name: 'Opportunity Desk', url: 'https://opportunitydesk.org/feed/', tier: 1, alternateUrls: ['https://opportunitydesk.org/feed', 'https://opportunitydesk.org/?feed=rss2'] },
  { name: 'Youth Op', url: 'https://www.youthop.com/feed', tier: 1, alternateUrls: ['https://www.youthop.com/feed/', 'https://www.youthop.com/rss'] },
  { name: 'OYA Opportunities', url: 'https://oyaop.com/feed/', tier: 1, alternateUrls: ['https://oyaop.com/rss/', 'https://oyaop.com/?feed=rss2'] },
  { name: 'Opportunities For Youth', url: 'https://opportunitiesforyouth.org/feed/', tier: 1, alternateUrls: ['https://opportunitiesforyouth.org/rss'] },
  { name: 'Opportunities Radar', url: 'https://opportunitiesradar.com/feed/', tier: 1, alternateUrls: ['https://opportunitiesradar.com/rss/'] },
  { name: 'Funds For NGOs', url: 'https://www2.fundsforngos.org/feed/', tier: 2, alternateUrls: ['https://www2.fundsforngos.org/rss/'] },
  { name: 'Global Grants Hub', url: 'https://globalgrantshub.org/feed/', tier: 2, alternateUrls: ['https://globalgrantshub.org/rss/'] },
  { name: 'Student Competitions', url: 'https://studentcompetitions.com/rss', tier: 2, alternateUrls: ['https://studentcompetitions.com/feed', 'https://studentcompetitions.com/feed.xml'] },
  { name: 'Opportunities Corners', url: 'https://opportunitiescorners.com/feed/', tier: 2, alternateUrls: ['https://opportunitiescorners.com/rss/'] },
  { name: 'Best Delegate', url: 'https://bestdelegate.com/feed/', tier: 2, alternateUrls: ['https://bestdelegate.com/rss/', 'https://bestdelegate.com/feed.xml'] },
  { name: 'My MUN', url: 'https://mymun.com/', tier: 3, alternateUrls: ['https://mymun.com/conferences', 'https://mymun.com'] },
  { name: 'Best Delegate MUN', url: 'https://bestdelegate.com/model-un-conferences/', tier: 3, alternateUrls: ['https://bestdelegate.com/model-un-conferences/feed', 'https://bestdelegate.com/model-un-conferences/rss/'] },
];

const CACHE_TTL_MS_BY_TIER: Record<RSSSourceTier, number> = {
  1: 1000 * 60 * 60 * 6,
  2: 1000 * 60 * 60 * 12,
  3: 1000 * 60 * 60 * 24,
};

const EXCLUDE_PATTERNS = [
  'website building',
  'web design',
  'website design',
  'build a website',
  'create a website',
  'html css challenge',
  'website builder',
  'full-time job',
  'remote job',
  'software engineer',
  'security engineer',
  'data analyst role',
];

function cleanText(value: string | null | undefined): string {
  return (value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const RSS_PROXY_CANDIDATES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
];

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/rss+xml, application/xml, text/xml, text/html, application/json' } });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFeedTextWithFallback(feedUrl: string): Promise<string> {
  const candidates = [
    `/.netlify/functions/fetch-feed?url=${encodeURIComponent(feedUrl)}`,
    ...RSS_PROXY_CANDIDATES.map((builder) => builder(feedUrl)),
  ];
  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      const text = await fetchWithTimeout(candidate, 5000);
      if (text && text.trim().length > 0) return text;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error(`Unable to fetch RSS feed: ${feedUrl}`);
}

async function fetchFeedTextWithFallbacks(feed: RSSFeedDefinition): Promise<string> {
  return fetchFeedTextWithFallback(feed.url);
}

function hashSeed(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function inferCategory(title: string, description: string): Category {
  const text = `${title} ${description}`.toLowerCase();

  if (/scholarship|study\s+(?:abroad|program|opportunity)|tuition waiver|fully funded.*study/.test(text)) return 'Scholarships';
  if (/fellowship/.test(text)) return 'Fellowships';
  if (/research|phd|lab|scientist/.test(text)) return 'Research';
  if (/exchange|travel|trip|fully funded/.test(text)) return 'Exchanges';
  if (/grant|funding|fund\b/.test(text)) return 'Grants';
  if (/competition|contest|prize|award|essay|writing|quiz|olympiad/.test(text)) return 'Competitions';
  if (/hackathon|coding|build\b/.test(text)) return 'Hackathons';
  if (/internship|intern\b/.test(text)) return 'Internships';
  if (/mun|model united/.test(text)) return 'MUN';
  if (/conference|summit|forum/.test(text)) return 'Conferences';

  return 'Competitions';
}

function inferFunding(text: string): Opportunity['funding'] {
  const value = text.toLowerCase();
  if (/fully funded|100% funded|travel support|stipend.*covered|tuition waiver/.test(value)) return 'fully_funded';
  if (/paid|salary|stipend/.test(value)) return 'paid';
  if (/cash award|prize|award/.test(value)) return 'prize';
  if (/partially funded|partial funding/.test(value)) return 'partially_funded';
  return 'self_funded';
}

function inferModality(text: string): Opportunity['modality'] {
  if (/online|virtual|remote/.test(text)) return 'online';
  if (/hybrid|blended/.test(text)) return 'hybrid';
  return 'in-person';
}

function inferWorldwide(text: string): boolean {
  return /worldwide|international|global|open to all|all nationalities|any country|online|remote/i.test(text);
}

function extractDeadline(text: string): string | undefined {
  const isoMatch = text.match(/\b20\d{2}[-/]\d{1,2}[-/]\d{1,2}\b/);
  if (isoMatch) return isoMatch[0].replace(/\//g, '-');

  const literalMatch = text.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,|\s)\s*20\d{2}\b/i);
  if (!literalMatch) return undefined;

  const parsed = new Date(literalMatch[0].replace(/(\d+)(st|nd|rd|th)/i, '$1'));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

function normalizeOpportunity(feed: RSSFeedDefinition, rawTitle: string, rawDescription: string, rawUrl: string, pubDate = ''): Opportunity | null {
  const title = cleanText(rawTitle);
  const description = cleanText(rawDescription);
  const url = rawUrl && rawUrl.trim() ? rawUrl : feed.url;

  if (!title || title.length < 12) return null;

  const fullText = `${title} ${description} ${pubDate}`;
  const deadline = extractDeadline(fullText);
  const worldwide = inferWorldwide(fullText);
  const category = inferCategory(title, description);
  const today = new Date().toISOString();
  const normalizedTitle = title.replace(/\s+/g, ' ').trim();

  return {
    canonicalOpportunityId: `rss_${feed.tier}_${hashSeed(`${feed.name}|${normalizedTitle.toLowerCase()}`)}`,
    title: normalizedTitle,
    organization: feed.name,
    category,
    description: description || `Opportunity from ${feed.name}.`,
    officialSourceUrl: url,
    applicationUrl: url,
    country: worldwide ? 'Worldwide' : 'Not specified',
    worldwide,
    modality: inferModality(fullText),
    deadline,
    funding: inferFunding(fullText),
    applicationFee: 0,
    verificationStatus: 'verified',
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

function parseRSSXml(xmlText: string, feed: RSSFeedDefinition): Opportunity[] {
  const document = new DOMParser().parseFromString(xmlText, 'application/xml');
  const items = Array.from(document.querySelectorAll('item, entry')).slice(0, 250);

  return items
    .map((item) => {
      const title = item.querySelector('title')?.textContent || '';
      const linkNode = item.querySelector('link');
      const link = linkNode?.getAttribute('href') || linkNode?.textContent || feed.url;
      const description = item.querySelector('description, summary, content\:encoded, encoded')?.textContent || '';
      const pubDate = item.querySelector('pubDate, published, updated')?.textContent || '';
      return normalizeOpportunity(feed, title, description, link, pubDate);
    })
    .filter(Boolean) as Opportunity[];
}

async function fetchFeedText(feedUrl: string): Promise<string> {
  return fetchFeedTextWithFallback(feedUrl);
}

interface FeedResult {
  name: string;
  url: string;
  tier: RSSSourceTier;
  ok: boolean;
  itemCount: number;
  opportunities: Opportunity[];
  lastChecked: string;
}

const FEED_CACHE_PREFIX = 'pathlight_rss_feed_v2_';

function readFeedCache(feed: RSSFeedDefinition): { updatedAt: string; opportunities: Opportunity[] } | null {
  try {
    const raw = localStorage.getItem(`${FEED_CACHE_PREFIX}${hashSeed(feed.name)}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.updatedAt && Array.isArray(parsed.opportunities)) return parsed;
  } catch {
    // Ignore malformed cache entries.
  }
  return null;
}

function writeFeedCache(feed: RSSFeedDefinition, opportunities: Opportunity[]): void {
  try {
    localStorage.setItem(`${FEED_CACHE_PREFIX}${hashSeed(feed.name)}`, JSON.stringify({ updatedAt: new Date().toISOString(), opportunities }));
  } catch {
    // Caching is best effort.
  }
}

async function fetchSingleFeed(feed: RSSFeedDefinition): Promise<FeedResult> {
  const checkedAt = new Date().toISOString();
  const cache = readFeedCache(feed);
  const cacheIsFresh = cache && Date.now() - new Date(cache.updatedAt).getTime() < CACHE_TTL_MS_BY_TIER[feed.tier];

  if (cacheIsFresh) {
    return { name: feed.name, url: feed.url, tier: feed.tier, ok: true, itemCount: cache.opportunities.length, opportunities: cache.opportunities, lastChecked: cache.updatedAt };
  }

  try {
    const text = await fetchFeedTextWithFallbacks(feed);
    const opportunities = parseRSSXml(text, feed);
    const filtered = opportunities.filter((opp) => !EXCLUDE_PATTERNS.some((pattern) => `${opp.title} ${opp.description}`.toLowerCase().includes(pattern)));
    const active = filtered.filter((opportunity) => !opportunity.deadline || new Date(opportunity.deadline).getTime() >= Date.now());
    writeFeedCache(feed, active);
    return { name: feed.name, url: feed.url, tier: feed.tier, ok: true, itemCount: active.length, opportunities: active, lastChecked: checkedAt };
  } catch {
    console.log(`${feed.name}: fail (0)`);
    return { name: feed.name, url: feed.url, tier: feed.tier, ok: false, itemCount: 0, opportunities: [], lastChecked: checkedAt };
  }
}

export function getCachedRSSOpportunities(): Opportunity[] {
  const all: Opportunity[] = [];
  for (const feed of FEEDS) {
    const cache = readFeedCache(feed);
    if (cache && Date.now() - new Date(cache.updatedAt).getTime() < CACHE_TTL_MS_BY_TIER[feed.tier]) {
      all.push(...cache.opportunities);
    }
  }
  return deduplicateOpportunities(all);
}

export function filterRSSOpportunityForProfile(opportunity: Opportunity, profile: UserProfile): boolean {
  const text = `${opportunity.title} ${opportunity.description} ${opportunity.country}`.toLowerCase();

  if (opportunity.deadline && new Date(opportunity.deadline).getTime() < Date.now()) return false;
  if (EXCLUDE_PATTERNS.some((pattern) => text.includes(pattern))) return false;

  if (opportunity.worldwide) return true;
  if (!opportunity.country || opportunity.country === 'Not specified' || opportunity.country === 'Worldwide') return true;

  const profileCountry = (profile.country || '').toLowerCase();
  const citizenship = (profile.citizenship || '').toLowerCase();
  const countryText = opportunity.country.toLowerCase();

  return countryText.includes(profileCountry) || countryText.includes(citizenship) || countryText.includes('global') || countryText.includes('worldwide');
}

export async function fetchRSSSources(onSource?: (result: FeedResult, completed: number) => void): Promise<FeedResult[]> {
  let completed = 0;
  const settled = await Promise.allSettled(FEEDS.map((feed) => fetchSingleFeed(feed).then((value) => {
    completed += 1;
    onSource?.(value, completed);
    return value;
  })));

  const results = settled.map((result, index) => {
    const feed = FEEDS[index];
    return result.status === 'fulfilled'
      ? result.value
      : { name: feed.name, url: feed.url, tier: feed.tier, ok: false, itemCount: 0, opportunities: [], lastChecked: new Date().toISOString() };
  });
  return results;
}

export async function fetchRSSSourceStatus(): Promise<RSSSourceStatus[]> {
  const results = await fetchRSSSources();
  return results.map(({ opportunities, ...status }) => status);
}

export async function fetchAllRSSFeeds(): Promise<Opportunity[]> {
  const results = await fetchRSSSources();
  return deduplicateOpportunities(results.flatMap((result) => result.opportunities));
}

export async function fetchRSSOpportunities(): Promise<RSSAggregateResult> {
  const opportunities = await fetchAllRSSFeeds();

  return {
    opportunities,
    updatedAt: new Date().toISOString(),
    sourceStatuses: FEEDS.map((feed) => ({
      name: feed.name,
      url: feed.url,
      tier: feed.tier,
      ok: true,
      itemCount: opportunities.filter((opportunity) => opportunity.sources.some((source) => source.sourceName === feed.name)).length,
      lastChecked: new Date().toISOString(),
    })),
  };
}

export function shouldRefreshRSSCache(): boolean {
  return getCachedRSSOpportunities().length === 0;
}

export function getRSSCacheAgeMs(): number {
  return 0;
}

export function shouldRecommendOpportunityForProfile(opportunity: Opportunity, profile: UserProfile): boolean {
  const text = `${opportunity.title} ${opportunity.description} ${opportunity.country}`.toLowerCase();

  if (opportunity.minAge !== undefined && profile.age < opportunity.minAge) return false;
  if (opportunity.maxAge !== undefined && profile.age > opportunity.maxAge) return false;

  const countryMatch = !opportunity.country || opportunity.country === 'Not specified' || opportunity.country === 'Worldwide' ||
    opportunity.country.toLowerCase().includes(profile.country.toLowerCase()) ||
    opportunity.country.toLowerCase().includes(profile.citizenship.toLowerCase()) ||
    /global|worldwide/i.test(opportunity.country);

  if (!countryMatch) return false;

  if (!opportunity.fieldRequirements?.length || opportunity.fieldRequirements.some((rule) => /all fields|any/i.test(rule))) {
    return true;
  }

  return opportunity.fieldRequirements.some((field) => text.includes(field.toLowerCase()));
}
