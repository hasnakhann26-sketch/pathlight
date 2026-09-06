import { Category, Opportunity, UserProfile } from '../types';
import { deduplicateOpportunities } from './deduplication';

export type RSSSourceTier = 1 | 2 | 3;
export type ConnectorKind = 'api' | 'html';

export interface ConnectorDefinition {
  id: string;
  name: string;
  url: string;
  category: Category;
  tier: RSSSourceTier;
  kind: ConnectorKind;
  apiUrl?: string;
}

export interface RSSSourceStatus {
  id: string;
  name: string;
  url: string;
  category: Category;
  tier: RSSSourceTier;
  kind: ConnectorKind;
  ok: boolean;
  itemCount: number;
  lastChecked: string | null;
  lastSuccessfulUpdate: string | null;
  httpStatus: number | null;
  parsingStatus: 'success' | 'failed' | 'loading';
  errorMessage: string | null;
}

export interface ConnectorResult extends RSSSourceStatus {
  opportunities: Opportunity[];
}

export interface RSSAggregateResult {
  opportunities: Opportunity[];
  updatedAt: string;
  sourceStatuses: RSSSourceStatus[];
}

export const CONNECTORS: ConnectorDefinition[] = [
  { id: 'devpost', name: 'Devpost', url: 'https://devpost.com/hackathons', apiUrl: 'https://devpost.com/api/hackathons.json', category: 'Hackathons', tier: 1, kind: 'api' },
  { id: 'hackathon-radar', name: 'Hackathon Radar', url: 'https://www.hackathonradar.com/', category: 'Hackathons', tier: 1, kind: 'html' },
  { id: 'unstop', name: 'Unstop', url: 'https://unstop.com/', category: 'Competitions', tier: 1, kind: 'html' },
  { id: 'kaggle', name: 'Kaggle', url: 'https://www.kaggle.com/competitions', apiUrl: 'https://www.kaggle.com/competitions.json', category: 'Hackathons', tier: 1, kind: 'api' },
  { id: 'ctftime', name: 'CTFtime', url: 'https://ctftime.org/', apiUrl: 'https://ctftime.org/api/v1/events/?limit=100', category: 'Hackathons', tier: 1, kind: 'api' },
  { id: 'topcoder', name: 'Topcoder', url: 'https://www.topcoder.com/challenges', apiUrl: 'https://api.topcoder.com/v5/challenges', category: 'Competitions', tier: 1, kind: 'api' },
  { id: 'hackerrank', name: 'HackerRank', url: 'https://www.hackerrank.com/contests', category: 'Competitions', tier: 1, kind: 'html' },
  { id: 'herox', name: 'HeroX', url: 'https://www.herox.com/crowdsourcing-projects', category: 'Grants', tier: 1, kind: 'html' },
  { id: 'google-impact', name: 'Google.org Impact Challenges', url: 'https://www.google.org/impact-challenges/', category: 'Grants', tier: 1, kind: 'html' },
  { id: 'us-government-challenges', name: 'USA.gov Government Challenges', url: 'https://www.challenge.gov/', category: 'Grants', tier: 1, kind: 'html' },
  { id: 'hanlin', name: 'Hanlin International Academic Competitions Hub', url: 'https://en.hanlin.com/competitions', category: 'Competitions', tier: 1, kind: 'html' },
  { id: 'studentcompetitions', name: 'StudentCompetitions.com', url: 'https://studentcompetitions.com/', category: 'Competitions', tier: 1, kind: 'html' },
  { id: 'doq', name: 'DoQ', url: 'https://doq.global/', category: 'Competitions', tier: 1, kind: 'html' },
  { id: 'iac', name: 'International Academic Competitions (IAC)', url: 'https://www.iac-exams.com/', category: 'Competitions', tier: 1, kind: 'html' },
  { id: 'reedsy', name: 'Reedsy', url: 'https://reedsy.com/creative-writing-prompts/contests', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'globe-soup', name: 'Globe Soup', url: 'https://globe-soup.net/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'intercompetition', name: 'InterCompetition', url: 'https://intercompetition.com/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'wodacc', name: 'WODACC', url: 'https://www.wodacc.com/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'awardwatch', name: 'AwardWatch', url: 'https://www.awardwatch.net/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'filmfreeway', name: 'FilmFreeway', url: 'https://filmfreeway.com/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'filmcalls', name: 'FilmCalls', url: 'https://filmcalls.net/en/festivals', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'student-academy-awards', name: 'Student Academy Awards', url: 'https://www.oscars.org/saa', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'bafta-student-awards', name: 'BAFTA Student Awards', url: 'https://www.bafta.org/programmes/bafta-student-awards/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'cannes-la-cinef', name: 'Cannes La Cinef', url: 'https://www.festival-cannes.com/en/take-part/submit-a-film/la-cinef-rules-and-regulations/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'world-quizzing', name: 'World Quizzing Championships', url: 'https://www.worldquizzing.com/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'international-quizzing', name: 'International Quizzing Championships', url: 'https://internationalquizzingchampionships.com/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'international-geography-bee', name: 'International Geography Bee', url: 'https://www.internationalgeographybee.com/', category: 'Competitions', tier: 2, kind: 'html' },
  { id: 'world-debate-collective', name: 'World Debate Collective', url: 'https://www.worlddebatecollective.org/', category: 'Competitions', tier: 3, kind: 'html' },
  { id: 'deb8er-global', name: 'Deb8er Global', url: 'https://deb8er.global/', category: 'Competitions', tier: 3, kind: 'html' },
];

const CACHE_PREFIX = 'pathlight_connector_cache_v2_';
const CACHE_TTL: Record<RSSSourceTier, number> = { 1: 6 * 60 * 60 * 1000, 2: 12 * 60 * 60 * 1000, 3: 24 * 60 * 60 * 1000 };
const TERMS = /competition|contest|challenge|hackathon|scholarship|award|prize|call for|deadline|apply|submission|fellowship|grant|quiz|olympiad|debate|mun|film festival/i;

function text(value: unknown): string { return String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function hash(value: string): string { let result = 0; for (let index = 0; index < value.length; index += 1) result = (result << 5) - result + value.charCodeAt(index) | 0; return Math.abs(result).toString(36); }
function deadline(value: string): string | undefined { const match = value.match(/\b20\d{2}[-/]\d{1,2}[-/]\d{1,2}\b/); return match?.[0].replace(/\//g, '-'); }
function classify(value: string, fallback: Category): Category { const lower = value.toLowerCase(); if (/mun|model united/.test(lower)) return 'MUN'; if (/hackathon|coding/.test(lower)) return 'Hackathons'; if (/scholarship|study abroad/.test(lower)) return 'Scholarships'; if (/fellowship/.test(lower)) return 'Fellowships'; if (/research|phd|lab/.test(lower)) return 'Research'; if (/exchange|travel/.test(lower)) return 'Exchanges'; if (/grant|funding|fund\b/.test(lower)) return 'Grants'; if (/internship|intern\b/.test(lower)) return 'Internships'; if (/conference|summit|forum/.test(lower)) return 'Conferences'; return fallback; }

function normalize(connector: ConnectorDefinition, title: unknown, description: unknown, url: unknown, location?: unknown): Opportunity | null {
  const cleanTitle = text(title);
  const cleanDescription = text(description);
  if (cleanTitle.length < 8 || connector.kind === 'html' && !TERMS.test(`${cleanTitle} ${cleanDescription}`)) return null;
  const sourceUrl = text(url) || connector.url;
  const now = new Date().toISOString();
  return { canonicalOpportunityId: `connector_${connector.id}_${hash(sourceUrl || cleanTitle)}`, title: cleanTitle, organization: connector.name, category: classify(`${cleanTitle} ${cleanDescription}`, connector.category), description: cleanDescription || `${cleanTitle} from ${connector.name}.`, officialSourceUrl: sourceUrl, applicationUrl: sourceUrl, country: text(location) || 'Worldwide', worldwide: !location || /worldwide|global|international|remote|online/i.test(String(location)), modality: /online|remote|virtual/i.test(`${cleanTitle} ${cleanDescription}`) ? 'online' : 'in-person', deadline: deadline(`${cleanTitle} ${cleanDescription}`), funding: /prize|award/i.test(`${cleanTitle} ${cleanDescription}`) ? 'prize' : /paid|stipend/i.test(`${cleanTitle} ${cleanDescription}`) ? 'paid' : 'self_funded', applicationFee: 0, verificationStatus: 'verified', lastVerified: now, sourceCount: 1, sources: [{ sourceName: connector.name, sourceType: 'public_feed', sourceUrl: connector.url, retrievedAt: now }] };
}

function parseJson(value: unknown, connector: ConnectorDefinition): Opportunity[] {
  const records = Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value as Record<string, unknown>).flatMap((item) => Array.isArray(item) ? item : []) : [];
  return records.map((record) => { if (!record || typeof record !== 'object') return null; const item = record as Record<string, unknown>; return normalize(connector, item.title || item.name || item.challengeName || item.event_name, item.description || item.summary || item.details, item.url || item.link || item.website, item.location); }).filter(Boolean) as Opportunity[];
}

function parseHtml(source: string, connector: ConnectorDefinition): Opportunity[] {
  const document = new DOMParser().parseFromString(source, 'text/html');
  const records: Opportunity[] = [];
  const seen = new Set<string>();
  const add = (title: unknown, description: unknown, url: unknown) => { const opportunity = normalize(connector, title, description, url); if (opportunity && !seen.has(opportunity.canonicalOpportunityId)) { seen.add(opportunity.canonicalOpportunityId); records.push(opportunity); } };
  document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => { try { parseJson(JSON.parse(node.textContent || '{}'), connector).forEach((item) => add(item.title, item.description, item.officialSourceUrl)); } catch { /* continue with HTML */ } });
  document.querySelectorAll('article, li, [class*="card"], [class*="event"], [class*="competition"]').forEach((node) => { const content = text(node.textContent); const heading = node.querySelector('h1,h2,h3,h4,h5,strong,a')?.textContent; const link = (node.querySelector('a[href]') as HTMLAnchorElement | null)?.href; if (content.length >= 30 && TERMS.test(content)) add(heading, content, link); });
  return records;
}

function readCache(connector: ConnectorDefinition): { updatedAt: string; opportunities: Opportunity[] } | null { try { const result = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${connector.id}`) || 'null'); return result?.updatedAt && Array.isArray(result.opportunities) ? result : null; } catch { return null; } }
function writeCache(connector: ConnectorDefinition, opportunities: Opportunity[]): void { try { localStorage.setItem(`${CACHE_PREFIX}${connector.id}`, JSON.stringify({ updatedAt: new Date().toISOString(), opportunities })); } catch { /* best effort */ } }

async function fetchOne(connector: ConnectorDefinition): Promise<ConnectorResult> {
  const checked = new Date().toISOString();
  const cached = readCache(connector);
  if (cached && Date.now() - new Date(cached.updatedAt).getTime() < CACHE_TTL[connector.tier]) return { ...connector, ok: true, itemCount: cached.opportunities.length, lastChecked: cached.updatedAt, lastSuccessfulUpdate: cached.updatedAt, httpStatus: 200, parsingStatus: 'success', errorMessage: null, opportunities: cached.opportunities };
  try {
    const target = connector.apiUrl || connector.url;
    const endpoint = connector.apiUrl ? target : `/.netlify/functions/fetch-feed?url=${encodeURIComponent(target)}`;
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json, application/xml, text/html' } });
    if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), { status: response.status });
    const payload = await response.text();
    const opportunities = connector.kind === 'api' ? parseJson(JSON.parse(payload), connector) : parseHtml(payload, connector);
    const active = opportunities.filter((item) => !item.deadline || new Date(item.deadline).getTime() >= Date.now());
    if (!active.length) throw new Error('parser returned 0 opportunities');
    writeCache(connector, active);
    return { ...connector, ok: true, itemCount: active.length, lastChecked: checked, lastSuccessfulUpdate: checked, httpStatus: response.status, parsingStatus: 'success', errorMessage: null, opportunities: active };
  } catch (error) { const failure = error as Error & { status?: number }; return { ...connector, ok: false, itemCount: 0, lastChecked: checked, lastSuccessfulUpdate: cached?.updatedAt || null, httpStatus: failure.status || null, parsingStatus: 'failed', errorMessage: failure.message || 'source unavailable', opportunities: [] }; }
}

export async function fetchRSSSources(onSource?: (result: ConnectorResult, completed: number) => void): Promise<ConnectorResult[]> { let completed = 0; const settled = await Promise.allSettled(CONNECTORS.map((connector) => fetchOne(connector).then((result) => { completed += 1; onSource?.(result, completed); return result; }))); return settled.map((result, index) => result.status === 'fulfilled' ? result.value : ({ ...CONNECTORS[index], ok: false, itemCount: 0, lastChecked: new Date().toISOString(), lastSuccessfulUpdate: null, httpStatus: null, parsingStatus: 'failed', errorMessage: 'source unavailable', opportunities: [] })); }
export async function fetchAllRSSFeeds(): Promise<Opportunity[]> { return deduplicateOpportunities((await fetchRSSSources()).flatMap((result) => result.opportunities)); }
export async function fetchRSSSourceStatus(): Promise<RSSSourceStatus[]> { return (await fetchRSSSources()).map(({ opportunities: _opportunities, ...status }) => status); }
export function getCachedRSSOpportunities(): Opportunity[] { return deduplicateOpportunities(CONNECTORS.flatMap((connector) => { const cache = readCache(connector); return cache && Date.now() - new Date(cache.updatedAt).getTime() < CACHE_TTL[connector.tier] ? cache.opportunities : []; })); }
export function filterRSSOpportunityForProfile(opportunity: Opportunity, profile: UserProfile): boolean { if (opportunity.deadline && new Date(opportunity.deadline).getTime() < Date.now()) return false; if (opportunity.worldwide || !opportunity.country || opportunity.country === 'Worldwide') return true; return opportunity.country.toLowerCase().includes(profile.country.toLowerCase()) || opportunity.country.toLowerCase().includes(profile.citizenship.toLowerCase()); }
export async function fetchRSSOpportunities(): Promise<RSSAggregateResult> { const results = await fetchRSSSources(); return { opportunities: deduplicateOpportunities(results.flatMap((result) => result.opportunities)), updatedAt: new Date().toISOString(), sourceStatuses: results.map(({ opportunities: _opportunities, ...status }) => status) }; }
export function shouldRefreshRSSCache(): boolean { return getCachedRSSOpportunities().length === 0; }
export function getRSSCacheAgeMs(): number { return 0; }
export function shouldRecommendOpportunityForProfile(opportunity: Opportunity, profile: UserProfile): boolean { return filterRSSOpportunityForProfile(opportunity, profile); }
