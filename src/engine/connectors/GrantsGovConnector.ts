import { Opportunity } from '../../types';
import {
  OpportunityConnector,
  ConnectorFetchResult,
  ConnectorFetchOptions,
  ConnectorHealthCheck,
  ConnectorStatus,
} from './OpportunityConnector';

/**
 * Grants.gov Connector
 *
 * Connects to Grants.gov API v1 to fetch federal grant and funding opportunities.
 * Uses the public search2 endpoint which requires no API key.
 *
 * API: https://www.grants.gov/api
 * Endpoint: https://api.grants.gov/v1/api/search2
 *
 * Status: API_READY (implemented, not yet tested in production)
 */
export class GrantsGovConnector extends OpportunityConnector {
  private apiBaseUrl = 'https://api.grants.gov/v1/api';
  private defaultPageSize = 100;
  private maxRetries = 3;

  constructor() {
    super({
      connectorId: 'grants_gov',
      name: 'Grants.gov',
      sourceUrl: 'https://www.grants.gov',
      sourceType: 'API',
      accessMethod: 'LIVE_API',
      coverageCategories: ['Grants', 'Fellowships', 'Competitions', 'Research', 'Other'],
      permissionStatus: 'TERMS_BASED',
      enabled: true,
    });
  }

  /**
   * Fetch opportunities from Grants.gov API
   */
  async fetch(options?: ConnectorFetchOptions): Promise<ConnectorFetchResult> {
    const timestamp = new Date().toISOString();
    let lastError: string | undefined;
    let status: ConnectorStatus = 'API_READY';

    try {
      // Build query parameters
      const params = new URLSearchParams();

      // Filter for open opportunities
      params.append('statusInd', 'open');

      // Pagination
      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? this.defaultPageSize;
      params.append('pageOffset', String(offset));
      params.append('limit', String(limit));

      // Optional search terms
      if (options?.search) {
        params.append('searchTerms', options.search);
      }

      // Build URL
      const url = `${this.apiBaseUrl}/search2?${params.toString()}`;

      // Fetch with retry logic
      let response = null;
      let retries = 0;

      while (retries < this.maxRetries) {
        try {
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Pathlight/1.0 (Opportunity Discovery)',
            },
          });

          if (response.ok) {
            break;
          } else if (response.status === 429 || response.status >= 500) {
            retries++;
            if (retries < this.maxRetries) {
              // Exponential backoff
              await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (fetchError) {
          retries++;
          if (retries < this.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));
          }
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to fetch from Grants.gov after ${this.maxRetries} retries`);
      }

      const data = await response.json();

      // Extract opportunities
      const records: Opportunity[] = [];

      if (data.hits && Array.isArray(data.hits)) {
        for (const record of data.hits) {
          try {
            const normalized = this.normalizeRecord(record);
            if (normalized) {
              records.push(normalized);
            }
          } catch (normError) {
            console.warn('Failed to normalize Grants.gov record:', record, normError);
          }
        }
      }

      // Determine status based on successful fetch
      status = records.length > 0 ? 'LIVE' : 'API_READY';

      return {
        success: true,
        records,
        totalCount: data.totalRecords ?? records.length,
        fetchedCount: records.length,
        timestamp,
        sourceStatus: status,
        message: `Successfully fetched ${records.length} opportunities from Grants.gov`,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        records: [],
        totalCount: 0,
        fetchedCount: 0,
        timestamp,
        sourceStatus: 'ERROR',
        message: `Failed to fetch from Grants.gov: ${lastError}`,
        error: lastError,
      };
    }
  }

  /**
   * Health check: verify API connectivity and recent data
   */
  async healthCheck(): Promise<ConnectorHealthCheck> {
    const lastChecked = new Date().toISOString().split('T')[0];

    try {
      const result = await fetch(`${this.apiBaseUrl}/search2?pageOffset=0&limit=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Pathlight/1.0 (Health Check)',
        },
      });

      if (result.ok) {
        const data = await result.json();
        return {
          status: 'LIVE',
          lastChecked,
          message: 'Grants.gov API is operational',
          isHealthy: true,
          recordCount: data.totalRecords ?? 0,
        };
      } else {
        return {
          status: 'ERROR',
          lastChecked,
          message: `Grants.gov API returned HTTP ${result.status}`,
          isHealthy: false,
          errorMessage: result.statusText,
        };
      }
    } catch (error) {
      return {
        status: 'ERROR',
        lastChecked,
        message: 'Failed to check Grants.gov API health',
        isHealthy: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Normalize a Grants.gov record into Pathlight Opportunity schema
   *
   * Grants.gov response fields:
   * - opportunityID
   * - opportunityTitle
   * - agencyCode, agencyName
   * - categoryDescription
   * - fundingInstrumentCode, fundingInstrumentDescription
   * - applicantEligibilityDescription
   * - applicantTypeDescription
   * - fundingActivityCode, fundingActivityDescription
   * - estimatedFundingAmount, expectedNumberOfAwards
   * - applicationDeadlineDate, openDate, closedDate, lastUpdatedDate
   * - packageListUrl, applicantURL
   */
  protected normalizeRecord(record: any): Opportunity | null {
    try {
      // Extract required fields
      const externalId = this.normalizeString(record.opportunityID);
      const title = this.normalizeString(record.opportunityTitle);
      const organization = this.normalizeString(record.agencyName);

      if (!externalId || !title || !organization) {
        console.warn('Grants.gov record missing required fields:', { externalId, title, organization });
        return null;
      }

      // Generate canonical ID
      const canonicalOpportunityId = this.generateCanonicalId(externalId);

      // Extract dates
      const openingDate = this.parseDate(record.openDate);
      const deadline = this.parseDate(record.applicationDeadlineDate);

      // Extract category from funding description
      const categoryDescription = this.normalizeString(record.fundingInstrumentDescription);
      let category = this.normalizeCategory(categoryDescription);
      if (!category) {
        category = 'Grants'; // Default for Grants.gov
      }

      // Extract subcategory
      const fundingActivityDescription = this.normalizeString(record.fundingActivityDescription);

      // Extract eligibility
      const eligibilityExplanation = this.normalizeString(record.applicantEligibilityDescription);
      const applicantTypeDescription = this.normalizeString(record.applicantTypeDescription);

      // Extract funding info
      let funding: 'fully_funded' | 'paid' | 'prize' | 'partially_funded' | 'self_funded' | undefined = undefined;
      let prize: string | undefined = undefined;

      const estimatedAmount = record.estimatedFundingAmount;
      if (estimatedAmount && typeof estimatedAmount === 'number' && estimatedAmount > 0) {
        funding = 'fully_funded';
        prize = `$${estimatedAmount.toLocaleString()}`;
      }

      // Build sources array
      const sources = [
        {
          sourceName: 'Grants.gov',
          sourceType: 'public_feed' as const,
          sourceUrl: this.sourceUrl,
          retrievedAt: new Date().toISOString().split('T')[0],
        },
      ];

      // Add application/official URLs if available
      let applicationUrl: string | undefined = this.normalizeString(record.applicantURL);
      let officialSourceUrl: string | undefined = this.normalizeString(record.packageListUrl);

      // Default to Grants.gov base URL if no specific URL provided
      if (!applicationUrl) {
        applicationUrl = `https://www.grants.gov/search-results-detail/${externalId}`;
      }
      if (!officialSourceUrl) {
        officialSourceUrl = `https://www.grants.gov/search-results-detail/${externalId}`;
      }

      // Construct opportunity
      const opportunity: Opportunity = {
        canonicalOpportunityId,
        title,
        organization,
        category,
        subcategory: fundingActivityDescription,
        description:
          eligibilityExplanation ||
          applicantTypeDescription ||
          `Federal grant opportunity from ${organization}. Visit Grants.gov for full details.`,
        officialSourceUrl,
        applicationUrl,
        country: 'United States',
        worldwide: false,
        modality: 'online',
        deadline,
        openingDate,
        funding,
        prize,
        applicationFee: 0,
        eligibilityExplanation,
        verificationStatus: 'verified',
        lastVerified: new Date().toISOString().split('T')[0],
        sourceCount: sources.length,
        sources,
      };

      return opportunity;
    } catch (error) {
      console.warn('Error normalizing Grants.gov record:', record, error);
      return null;
    }
  }
}

export default GrantsGovConnector;
