import { Opportunity } from '../../types';

export interface ConnectorResult {
  success: boolean;
  sourceStatus: string;
  message: string;
  fetchedCount: number;
  records: Opportunity[];
}

export interface OpportunityConnector {
  fetch: (options?: { limit?: number }) => Promise<ConnectorResult>;
}
