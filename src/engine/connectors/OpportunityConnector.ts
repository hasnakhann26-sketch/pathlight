import { Opportunity, Category } from '../../types';

export type ConnectorStatus = 'LIVE' | 'API_READY' | 'SOURCE_LINK_ONLY' | 'MANUAL' | 'DISABLED' | 'ERROR';
export type AccessMethod = 'LIVE_API' | 'SCHEDULED_FETCH' | 'SOURCE_LINK_ONLY' | 'MANUAL_ENTRY';

export interface ConnectorHealthCheck {
  status: ConnectorStatus;
  lastChecked: string; // ISO date
  message: string;
  isHealthy: boolean;
  recordCount?: number;
  errorMessage?: string;
}

export interface ConnectorFetchOptions {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  country?: string;
  [key: string]: any;
}

export interface ConnectorFetchResult {
  success: boolean;
  records: Opportunity[];
  totalCount: number;
  fetchedCount: number;
  timestamp: string;
  sourceStatus: ConnectorStatus;
  message: string;
  error?: string;
}

/**
 * Abstract base class for Pathlight Opportunity Connectors.
 * 
 * All connectors must:
 * 1. Fetch from authorized sources
 * 2. Normalize records into the existing Pathlight Opportunity schema
 * 3. Preserve original source URLs and identifiers
 * 4. Handle pagination and rate limiting
 * 5. Report honest status (LIVE/API_READY/SOURCE_LINK_ONLY/MANUAL/DISABLED/ERROR)
 * 6. Never scrape without explicit permission
 * 7. Respect API terms of service
 */
export abstract class OpportunityConnector {
  protected connectorId: string;
  protected name: string;
  protected sourceUrl: string;
  protected sourceType: string; // e.g., 'API', 'RSS', 'CSV', 'HTML', 'LINK_ONLY'
  protected accessMethod: AccessMethod;
  protected coverageCategories: string[];
  protected permissionStatus: string; // 'APPROVED', 'TERMS_BASED', 'MANUAL', 'LINK_ONLY', 'NOT_PERMITTED'
  protected enabled: boolean;

  constructor(config: {
    connectorId: string;
    name: string;
    sourceUrl: string;
    sourceType: string;
    accessMethod: AccessMethod;
    coverageCategories: string[];
    permissionStatus: string;
    enabled?: boolean;
  }) {
    this.connectorId = config.connectorId;
    this.name = config.name;
    this.sourceUrl = config.sourceUrl;
    this.sourceType = config.sourceType;
    this.accessMethod = config.accessMethod;
    this.coverageCategories = config.coverageCategories;
    this.permissionStatus = config.permissionStatus;
    this.enabled = config.enabled ?? true;
  }

  /**
   * Get connector metadata
   */
  public getMetadata() {
    return {
      connectorId: this.connectorId,
      name: this.name,
      sourceUrl: this.sourceUrl,
      sourceType: this.sourceType,
      accessMethod: this.accessMethod,
      coverageCategories: this.coverageCategories,
      permissionStatus: this.permissionStatus,
      enabled: this.enabled,
    };
  }

  /**
   * Fetch opportunities from the source.
   * Must be implemented by subclasses.
   */
  abstract fetch(options?: ConnectorFetchOptions): Promise<ConnectorFetchResult>;

  /**
   * Perform a health check on the connector.
   * Must be implemented by subclasses.
   */
  abstract healthCheck(): Promise<ConnectorHealthCheck>;

  /**
   * Normalize external record into Pathlight Opportunity schema.
   * Must be implemented by subclasses.
   */
  protected abstract normalizeRecord(record: any): Opportunity | null;

  /**
   * Generate a canonical opportunity ID for deduplication.
   * Format: {connectorId}_{externalId}
   */
  protected generateCanonicalId(externalId: string): string {
    return `opp_${this.connectorId}_${externalId}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }

  /**
   * Utility: safely extract and normalize strings
   */
  protected normalizeString(value: any): string | undefined {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    return undefined;
  }

  /**
   * Utility: safely parse dates
   */
  protected parseDate(value: any): string | undefined {
    try {
      if (typeof value === 'string') {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Utility: safely extract category
   */
  protected normalizeCategory(value: any): Category | undefined {
    const categoryMap: Record<string, Category> = {
      // Explicit mappings from various APIs
      'grant': 'Grants',
      'fellowship': 'Fellowships',
      'scholarship': 'Scholarships',
      'research': 'Research',
      'competition': 'Competitions',
      'hackathon': 'Hackathons',
      'internship': 'Internships',
      'exchange': 'Exchanges',
      'summer school': 'Summer schools',
      'conference': 'Conferences',
      'leadership': 'Leadership programs',
      'travel': 'Travel-funded programs',
      'award': 'Awards',
      'training': 'Training',
    };

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      for (const [key, category] of Object.entries(categoryMap)) {
        if (normalized.includes(key)) {
          return category;
        }
      }
    }

    return undefined;
  }

  /**
   * Utility: safely extract funding type
   */
  protected normalizeFunding(value: any): 'fully_funded' | 'paid' | 'prize' | 'partially_funded' | 'self_funded' | undefined {
    if (!value) return undefined;

    const lower = String(value).toLowerCase();

    if (lower.includes('full') || lower.includes('100%') || lower.includes('completely')) {
      return 'fully_funded';
    }
    if (lower.includes('paid') || lower.includes('stipend') || lower.includes('salary')) {
      return 'paid';
    }
    if (lower.includes('prize') || lower.includes('award') || lower.includes('cash')) {
      return 'prize';
    }
    if (lower.includes('partial') || lower.includes('partial funding')) {
      return 'partially_funded';
    }

    return undefined;
  }
}

export default OpportunityConnector;
