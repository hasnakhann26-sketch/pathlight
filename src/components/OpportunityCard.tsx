import React from 'react';
import { Bookmark, Check, Clock3, ExternalLink, MapPin, ShieldCheck } from 'lucide-react';
import { Opportunity, ApplicationStatus, MatchScoreResult } from '../types';
import { useApp } from '../context/AppContext';
import { calculateDeadlineStatus } from '../engine/matchingEngine';

interface OpportunityCardProps {
  opportunity: Opportunity;
  matchResult: MatchScoreResult;
  applicationView?: boolean;
}

const STATUS_OPTIONS: ApplicationStatus[] = ['Applied', 'In Review', 'Results Pending', 'Accepted', 'Rejected'];

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, matchResult, applicationView = false }) => {
  const { toggleSaveOpportunity, isSaved, setSelectedOpportunity, viewMode, applications, applyToOpportunity, updateApplicationStatus, updateApplicationNotes, isApplied } = useApp();
  const saved = isSaved(opportunity.canonicalOpportunityId);
  const applied = isApplied(opportunity.canonicalOpportunityId);
  const deadline = calculateDeadlineStatus(opportunity.deadline, opportunity.openingDate);
  const closingSoon = deadline.status === 'closing_soon' || deadline.status === 'closing_today';
  const funding = opportunity.funding === 'fully_funded' ? 'Fully funded' : opportunity.funding === 'paid' ? opportunity.stipend || 'Paid' : opportunity.funding === 'prize' ? opportunity.prize || 'Prize available' : opportunity.funding.replace('_', ' ');

  return (
    <article onClick={() => setSelectedOpportunity(opportunity)} className={`group flex cursor-pointer flex-col rounded-lg border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,24,39,0.10)] ${viewMode === 'list' ? 'sm:flex-row sm:items-center sm:gap-6' : ''}`}>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-green-50 px-2 py-1 text-[11px] font-semibold text-[#166534]">{opportunity.category}</span>
            {opportunity.verificationStatus === 'verified' && <span className="flex items-center gap-1 text-[11px] text-gray-500"><ShieldCheck className="h-3.5 w-3.5 text-[#16a34a]" />Verified</span>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleSaveOpportunity(opportunity.canonicalOpportunityId); }} className={`rounded p-1.5 ${saved ? 'bg-green-50 text-[#166534]' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`} aria-label={saved ? 'Remove saved opportunity' : 'Save opportunity'}>
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <p className="mb-1 text-xs font-medium text-gray-500">{opportunity.organization}</p>
        <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-gray-900 group-hover:text-[#166534]">{opportunity.title}</h3>
        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-gray-600">{opportunity.description}</p>

        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{opportunity.worldwide ? 'Worldwide' : opportunity.country}</span>
          <span className="font-medium capitalize text-gray-700">{funding}</span>
          <span className={`flex items-center gap-1 ${closingSoon ? 'font-semibold text-orange-600' : ''}`}><Clock3 className="h-3.5 w-3.5" />{closingSoon ? 'Closing Soon' : deadline.label}</span>
        </div>

        {applicationView ? (
          <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4" onClick={(e) => e.stopPropagation()}>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500">Status
              <select value={applications[opportunity.canonicalOpportunityId]?.status} onChange={(e) => updateApplicationStatus(opportunity.canonicalOpportunityId, e.target.value as ApplicationStatus)} className="rounded border bg-white px-2 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-[#15803d]">
                {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <input
              value={applications[opportunity.canonicalOpportunityId]?.notes || ''}
              onChange={(e) => updateApplicationNotes(opportunity.canonicalOpportunityId, e.target.value)}
              placeholder="Add a note"
              className="min-w-0 flex-1 rounded border px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-[#15803d]"
            />
            <a href={opportunity.applicationUrl} target="_blank" rel="noreferrer noopener" className="flex items-center gap-1 text-xs font-semibold text-[#166534] hover:underline">Open portal <ExternalLink className="h-3 w-3" /></a>
          </div>
        ) : (
          <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4" onClick={(e) => e.stopPropagation()}>
            <span className={`text-xs font-medium ${matchResult.isEligible ? 'text-[#166534]' : 'text-gray-500'}`}>{matchResult.totalScore}% match · {matchResult.isEligible ? 'Eligible' : 'Review eligibility'}</span>
            <button onClick={() => applyToOpportunity(opportunity.canonicalOpportunityId)} className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${applied ? 'bg-[#16a34a] text-white' : 'bg-[#166534] text-white hover:bg-[#15803d]'}`}>
              {applied ? <Check className="h-3.5 w-3.5" /> : null}{applied ? 'Applied' : 'Apply'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};