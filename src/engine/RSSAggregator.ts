import { Category, Opportunity, UserProfile } from '../types';
import { deduplicateOpportunities } from './deduplication';
import { normalizeOpportunityCategory } from './categoryNormalization';

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
  { name: 'My MUN', url: 'https://mymun.com/conferences', tier: 3, alternateUrls: ['https://mymun.com/'] },
  { name: 'Best Delegate MUN', url: 'https://bestdelegate.com/model-un-conferences/', tier: 3, alternateUrls: ['https://bestdelegate.com/model-un-conferences/feed', 'https://bestdelegate.com/model-un-conferences/rss/'] },
];

const CACHE_KEYS: Record<RSSSourceTier, string> = {
  1: 'pathlight_rss_tier1_cache_v1',
  2: 'pathlight_rss_tier2_cache_v1',
  3: 'pathlight_rss_tier3_cache_v1',
};

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

const buildNetlifyFeedUrl = (url: string) => `/.netlify/functions/fetch-feed?url=${encodeURIComponent(url)}`;

async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<string> {
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
  return fetchWithTimeout(buildNetlifyFeedUrl(feedUrl), 15000);
}

async function fetchFeedTextWithFallbacks(feed: RSSFeedDefinition): Promise<string> {
  const candidates = [feed.url, ...(feed.alternateUrls ?? [])];

  for (const candidate of candidates) {
    try {
      const text = await fetchFeedTextWithFallback(candidate);
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch {
      // Keep testing the next URL/proxy variant.
    }
  }

  throw new Error(`Unable to fetch any supported URL for ${feed.name}`);
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
  return normalizeOpportunityCategory('', `${title} ${description}`);
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

function parseHtmlListings(htmlText: string, feed: RSSFeedDefinition): Opportunity[] {
  const document = new DOMParser().parseFromString(htmlText, 'text/html');
  const anchors = Array.from(document.querySelectorAll('a[href]'))
    .map((node) => {
      const href = (node as HTMLAnchorElement).getAttribute('href') || '';
      const title = cleanText(node.textContent || '');
      if (!href || !title || title.length < 12) return null;

      let absoluteUrl = href.trim();
      try {
        absoluteUrl = new URL(href, feed.url).toString();
      } catch {
        return null;
      }

      if (!/^https?:\/\//i.test(absoluteUrl)) return null;
      return normalizeOpportunity(feed, title, '', absoluteUrl);
    })
    .filter(Boolean) as Opportunity[];

  return deduplicateOpportunities(anchors).slice(0, 250);
}

function parseFeedContent(feedText: string, feed: RSSFeedDefinition): Opportunity[] {
  const trimmed = feedText.trim().toLowerCase();
  const looksLikeXml = trimmed.startsWith('<?xml') || trimmed.startsWith('<rss') || trimmed.startsWith('<feed') || trimmed.startsWith('<rdf');
  return looksLikeXml ? parseRSSXml(feedText, feed) : parseHtmlListings(feedText, feed);
}

async function fetchSingleFeed(feed: RSSFeedDefinition): Promise<{ name: string; tier: RSSSourceTier; ok: boolean; itemCount: number; opportunities: Opportunity[] }> {
  try {
    const text = await fetchFeedTextWithFallbacks(feed);
    const opportunities = parseFeedContent(text, feed);
    const filtered = opportunities.filter((opp) => !EXCLUDE_PATTERNS.some((pattern) => `${opp.title} ${opp.description}`.toLowerCase().includes(pattern)));
    const ok = filtered.length > 0;
    console.log(`${feed.name}: ${filtered.length} items (${ok ? 'success' : 'fail'})`);
    return { name: feed.name, tier: feed.tier, ok, itemCount: filtered.length, opportunities: filtered };
  } catch (error) {
    console.log(`${feed.name}: fail (0)`);
    return { name: feed.name, tier: feed.tier, ok: false, itemCount: 0, opportunities: [] };
  }
}

function readTierCache(tier: RSSSourceTier): { updatedAt: string; opportunities: Opportunity[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEYS[tier]);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.updatedAt && Array.isArray(parsed.opportunities)) {
      return parsed as { updatedAt: string; opportunities: Opportunity[] };
    }
  } catch {
    // Ignore malformed cache entries.
  }

  return null;
}

function writeTierCache(tier: RSSSourceTier, opportunities: Opportunity[]): void {
  try {
    localStorage.setItem(
      CACHE_KEYS[tier],
      JSON.stringify({
        updatedAt: new Date().toISOString(),
        opportunities,
      })
    );
  } catch {
    // Cache is optional best effort.
  }
}

export function getCachedRSSOpportunities(): Opportunity[] {
  const all: Opportunity[] = [];
  for (const tier of [1, 2, 3] as RSSSourceTier[]) {
    const cache = readTierCache(tier);
    if (cache) all.push(...cache.opportunities);
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

export async function fetchRSSSourceStatus(): Promise<RSSSourceStatus[]> {
  const settled = await Promise.allSettled(FEEDS.map((feed) => fetchSingleFeed(feed)));

  return settled.map((result, index) => {
    const feed = FEEDS[index];

    if (result.status === 'fulfilled') {
      return {
        name: result.value.name,
        tier: result.value.tier,
        ok: result.value.ok,
        itemCount: result.value.itemCount,
        url: feed?.url ?? '',
      };
    }

    return {
      name: feed?.name ?? `Source ${index + 1}`,
      tier: feed?.tier ?? 1,
      ok: false,
      itemCount: 0,
      url: feed?.url ?? '',
    };
  });
}

export async function fetchAllRSSFeeds(): Promise<Opportunity[]> {
  const allOpportunities: Opportunity[] = [];

  for (const tier of [1, 2, 3] as RSSSourceTier[]) {
    const cache = readTierCache(tier);
    const ttl = CACHE_TTL_MS_BY_TIER[tier];

    if (cache && Date.now() - new Date(cache.updatedAt).getTime() < ttl) {
      allOpportunities.push(...cache.opportunities);
      continue;
    }

    const feedGroup = FEEDS.filter((feed) => feed.tier === tier);
    const settled = await Promise.allSettled(feedGroup.map((feed) => fetchSingleFeed(feed)));

    const results = settled
      .filter((result): result is PromiseFulfilledResult<{ name: string; tier: RSSSourceTier; ok: boolean; itemCount: number; opportunities: Opportunity[] }> => result.status === 'fulfilled')
      .map((result) => result.value);

    const tierOpps = deduplicateOpportunities(results.flatMap((result) => result.opportunities))
      .filter((opportunity) => !opportunity.deadline || new Date(opportunity.deadline).getTime() >= Date.now())
      .filter((opportunity) => !EXCLUDE_PATTERNS.some((pattern) => `${opportunity.title} ${opportunity.description}`.toLowerCase().includes(pattern)));

    writeTierCache(tier, tierOpps);
    allOpportunities.push(...tierOpps);
  }

  return deduplicateOpportunities(allOpportunities)
    .filter((opportunity) => !opportunity.deadline || new Date(opportunity.deadline).getTime() >= Date.now())
    .filter((opportunity) => !EXCLUDE_PATTERNS.some((pattern) => `${opportunity.title} ${opportunity.description}`.toLowerCase().includes(pattern)));
}

export async function fetchRSSOpportunities(): Promise<RSSAggregateResult> {
  const opportunities = await fetchAllRSSFeeds();

  return {
    opportunities,
    updatedAt: new Date().toISOString(),
    sourceStatuses: FEEDS.map((feed) => ({
      name: feed.name,
      tier: feed.tier,
      ok: true,
      itemCount: opportunities.filter((opportunity) => opportunity.sources.some((source) => source.sourceName === feed.name)).length,
    })),
  };
}

export function shouldRefreshRSSCache(): boolean {
  for (const tier of [1, 2, 3] as RSSSourceTier[]) {
    const cache = readTierCache(tier);
    if (!cache) return true;
    const age = Date.now() - new Date(cache.updatedAt).getTime();
    if (age > CACHE_TTL_MS_BY_TIER[tier]) return true;
  }
  return false;
}

export function getRSSCacheAgeMs(): number {
  const latest = [1, 2, 3]
    .map((tier) => readTierCache(tier as RSSSourceTier))
    .filter(Boolean)
    .map((entry) => new Date(entry!.updatedAt).getTime())
    .sort((a, b) => b - a)[0];

  if (!latest) return Number.POSITIVE_INFINITY;
  return Date.now() - latest;
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
