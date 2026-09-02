import React from 'react';
import { Bookmark, CalendarDays, Check, Clock3 } from 'lucide-react';
import { Opportunity, MatchScoreResult } from '../types';
import { useApp } from '../context/AppContext';
import { calculateDeadlineStatus } from '../engine/matchingEngine';

interface OpportunityCardProps {
  opportunity: Opportunity;
  matchResult: MatchScoreResult;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, matchResult }) => {
  const { toggleSaveOpportunity, isSaved, setSelectedOpportunity, applyToOpportunity, isApplied } = useApp();
  const saved = isSaved(opportunity.canonicalOpportunityId);
  const applied = isApplied(opportunity.canonicalOpportunityId);
  const deadline = calculateDeadlineStatus(opportunity.deadline, opportunity.openingDate);

  const deadlineColor = (() => {
    if (!opportunity.deadline) return 'text-emerald-600';
    const days = Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 7) return 'text-red-600';
    if (days < 30) return 'text-orange-500';
    return 'text-emerald-600';
  })();

  const deadlineText = (() => {
    if (!opportunity.deadline) return 'No deadline';
    const days = Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Closed';
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  })();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#166534]">
          {opportunity.category}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveOpportunity(opportunity.canonicalOpportunityId);
          }}
          className={`rounded-full p-2 ${saved ? 'bg-[#ecfdf5] text-[#166534]' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
          aria-label={saved ? 'Remove bookmark' : 'Save opportunity'}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <button type="button" onClick={() => setSelectedOpportunity(opportunity)} className="w-full text-left">
        <p className="text-xs font-medium text-slate-500">{opportunity.organization}</p>
        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">{opportunity.title}</h3>
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className={`inline-flex items-center gap-1.5 font-medium ${deadlineColor}`}>
          <CalendarDays className="h-3.5 w-3.5" />
          {deadlineText}
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700">
          {opportunity.funding === 'fully_funded' ? 'Fully funded' : opportunity.funding.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          {deadline.label}
        </div>
        <button
          type="button"
          onClick={() => applyToOpportunity(opportunity.canonicalOpportunityId)}
          className={`rounded-full px-3.5 py-2 text-xs font-semibold ${applied ? 'bg-[#166534] text-white' : 'bg-[#166534] text-white hover:bg-[#14532d]'}`}
        >
          {applied ? <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Applied</span> : 'Apply'}
        </button>
      </div>

      {matchResult && (
        <div className="mt-3 text-[11px] text-slate-500">{matchResult.totalScore}% match</div>
      )}
    </article>
  );
};