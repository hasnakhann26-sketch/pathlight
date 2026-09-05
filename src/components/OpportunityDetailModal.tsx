import React from 'react';
import { Bookmark, ExternalLink, MapPin, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OpportunityDetailModal: React.FC = () => {
  const { selectedOpportunity, setSelectedOpportunity, toggleSaveOpportunity, isSaved } = useApp();

  if (!selectedOpportunity) return null;

  const saved = isSaved(selectedOpportunity.canonicalOpportunityId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#166534]">
              {selectedOpportunity.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSaveOpportunity(selectedOpportunity.canonicalOpportunityId)}
              className={`rounded-lg p-2 ${saved ? 'bg-[#ecfdf5] text-[#166534]' : 'bg-slate-100 text-slate-500 hover:text-slate-700'}`}
              aria-label={saved ? 'Remove bookmark' : 'Save opportunity'}
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
            </button>
            <button type="button" onClick={() => setSelectedOpportunity(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close opportunity">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <p className="text-sm font-medium text-slate-500">{selectedOpportunity.organization}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{selectedOpportunity.title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-500" />
              {selectedOpportunity.worldwide ? 'Worldwide' : selectedOpportunity.country}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
              {selectedOpportunity.funding === 'fully_funded' ? 'Fully funded' : selectedOpportunity.funding.replace('_', ' ')}
            </span>
            {selectedOpportunity.deadline && (
              <span className="text-slate-600">Deadline: {selectedOpportunity.deadline}</span>
            )}
          </div>

          <p className="text-sm leading-7 text-slate-700">{selectedOpportunity.description}</p>

          {selectedOpportunity.eligibilityExplanation && (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Eligibility:</span> {selectedOpportunity.eligibilityExplanation}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <a
            href={selectedOpportunity.officialSourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Official info
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href={selectedOpportunity.applicationUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14532d]"
          >
            Apply now
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
