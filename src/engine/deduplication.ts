import { Opportunity, OpportunitySource } from '../types';

/**
 * Deduplicates opportunities using canonicalOpportunityId or fuzzy title + organization matching.
 * Merges source lists, increments sourceCount, and consolidates verification details.
 */
export function deduplicateOpportunities(opportunities: Opportunity[]): Opportunity[] {
  const map = new Map<string, Opportunity>();

  for (const opp of opportunities) {
    const canonicalKey = opp.canonicalOpportunityId
      ? opp.canonicalOpportunityId.trim().toLowerCase()
      : `${opp.title.trim().toLowerCase()}___${opp.organization.trim().toLowerCase()}`;

    if (!map.has(canonicalKey)) {
      map.set(canonicalKey, {
        ...opp,
        sourceCount: Math.max(opp.sourceCount || 1, opp.sources?.length || 1),
      });
    } else {
      const existing = map.get(canonicalKey)!;

      // Merge sources safely
      const existingUrls = new Set(existing.sources.map((s) => s.sourceUrl));
      const newSources: OpportunitySource[] = [...existing.sources];

      if (opp.sources) {
        for (const src of opp.sources) {
          if (!existingUrls.has(src.sourceUrl)) {
            newSources.push(src);
            existingUrls.add(src.sourceUrl);
          }
        }
      }

      // Combine duplicate notes
      const notes = [existing.duplicateNotes, opp.duplicateNotes]
        .filter(Boolean)
        .join('; ');

      // Pick latest verification date
      const latestVerified =
        new Date(existing.lastVerified) > new Date(opp.lastVerified)
          ? existing.lastVerified
          : opp.lastVerified;

      map.set(canonicalKey, {
        ...existing,
        // Keep the more complete description or official URL
        officialSourceUrl: existing.officialSourceUrl || opp.officialSourceUrl,
        applicationUrl: existing.applicationUrl || opp.applicationUrl,
        sources: newSources,
        sourceCount: newSources.length > 0 ? newSources.length : existing.sourceCount + 1,
        duplicateNotes: notes || `Merged duplicate records from multiple sources.`,
        lastVerified: latestVerified,
      });
    }
  }

  return Array.from(map.values());
}
