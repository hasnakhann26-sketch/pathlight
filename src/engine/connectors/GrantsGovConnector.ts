import { Opportunity, Category, FundingType } from '../../types';
import { OpportunityConnector, ConnectorResult } from './OpportunityConnector';

export class GrantsGovConnector implements OpportunityConnector {
  async fetch(options?: { limit?: number }): Promise<ConnectorResult> {
    const limit = options?.limit ?? 25;

    const records: Opportunity[] = [
      {
        canonicalOpportunityId: 'opp_grants_gov_demo_1',
        title: 'Research and Innovation Fellowship',
        organization: 'National Science Foundation',
        category: 'Research' as Category,
        description: 'A competitive research fellowship supporting early-career scientists and students in applied research projects.',
        officialSourceUrl: 'https://www.nsf.gov/',
        applicationUrl: 'https://www.nsf.gov/',
        country: 'United States',
        worldwide: false,
        modality: 'online',
        deadline: '2026-12-01',
        funding: 'fully_funded' as FundingType,
        applicationFee: 0,
        verificationStatus: 'verified',
        lastVerified: new Date().toISOString(),
        sourceCount: 1,
        sources: [{
          sourceName: 'Grants.gov',
          sourceType: 'official',
          sourceUrl: 'https://www.grants.gov/',
          retrievedAt: new Date().toISOString(),
        }],
      },
      {
        canonicalOpportunityId: 'opp_grants_gov_demo_2',
        title: 'Global STEM Exchange Award',
        organization: 'International Education Office',
        category: 'Exchanges' as Category,
        description: 'Travel and study funding for outstanding undergraduate and graduate students conducting international STEM exchange work.',
        officialSourceUrl: 'https://www.ed.gov/',
        applicationUrl: 'https://www.ed.gov/',
        country: 'Worldwide',
        worldwide: true,
        modality: 'hybrid',
        deadline: '2026-11-15',
        funding: 'fully_funded' as FundingType,
        applicationFee: 0,
        verificationStatus: 'verified',
        lastVerified: new Date().toISOString(),
        sourceCount: 1,
        sources: [{
          sourceName: 'Grants.gov',
          sourceType: 'official',
          sourceUrl: 'https://www.grants.gov/',
          retrievedAt: new Date().toISOString(),
        }],
      },
    ].slice(0, limit);

    return {
      success: true,
      sourceStatus: 'SUCCESS',
      message: 'Demo Grants.gov connector returned verified seed records.',
      fetchedCount: records.length,
      records,
    };
  }
}
