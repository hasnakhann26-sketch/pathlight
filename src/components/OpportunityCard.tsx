import React from 'react';
import { Opportunity, MatchScoreResult } from '../types';
import { useApp } from '../context/AppContext';
import { calculateDeadlineStatus } from '../engine/matchingEngine';
import {
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  matchResult: MatchScoreResult;
}

const CATEGORY_ICONS: Record<string, string> = {
  Scholarships: '🎓',
  Fellowships: '🔬',
  Research: '🧪',
  Exchanges: '🌎',
  Grants: '💰',
  Competitions: '🏆',
  Hackathons: '💻',
  Internships: '💼',
  'Summer schools': '☀️',
  Conferences: '🎙️',
  'Leadership programs': '⚡',
  'Travel-funded programs': '✈️',
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  matchResult,
}) => {
  const { toggleSaveOpportunity, isSaved, setSelectedOpportunity, viewMode } = useApp();
  const saved = isSaved(opportunity.canonicalOpportunityId);
  const deadlineInfo = calculateDeadlineStatus(opportunity.deadline, opportunity.openingDate);

  const icon = CATEGORY_ICONS[opportunity.category] || '✨';

  // Funding badge formatting
  const getFundingDisplay = () => {
    switch (opportunity.funding) {
      case 'fully_funded':
        return { label: 'Fully Funded', color: 'text-emerald-400 font-semibold' };
      case 'paid':
        return { label: opportunity.stipend || 'Paid Stipend', color: 'text-violet-300 font-semibold' };
      case 'prize':
        return { label: opportunity.prize || 'Prize / Award', color: 'text-indigo-300 font-semibold' };
      case 'partially_funded':
        return { label: 'Partially Funded', color: 'text-amber-300 font-medium' };
      default:
        return { label: 'Self-Funded', color: 'text-slate-400 font-normal' };
    }
  };

  const fundingDisplay = getFundingDisplay();

  // List View Rendering
  if (viewMode === 'list') {
    return (
      <div
        onClick={() => setSelectedOpportunity(opportunity)}
        className="bg-[#0f0a1d] rounded-2xl p-5 border border-violet-500/10 hover:border-violet-500/30 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative"
      >
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 shrink-0 text-xl">
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs text-slate-400">{opportunity.organization}</span>
              {opportunity.verificationStatus === 'verified' && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Verified source" />
              )}
              <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-800/40">
                {opportunity.category}
              </span>
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-violet-200 truncate">
              {opportunity.title}
            </h3>

            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
              <span className={fundingDisplay.color}>{fundingDisplay.label}</span>
              <span>•</span>
              <span>{opportunity.worldwide ? 'Worldwide' : opportunity.country}</span>
              <span>•</span>
              <span
                className={
                  deadlineInfo.status === 'closing_soon' || deadlineInfo.status === 'closing_today'
                    ? 'text-amber-400 font-medium'
                    : 'text-slate-400'
                }
              >
                {deadlineInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
          <div className="bg-violet-500/20 text-violet-400 px-2.5 py-1 rounded text-[10px] font-bold tracking-tighter">
            {matchResult.totalScore}% MATCH
          </div>

          <button
            aria-label={saved ? 'Remove bookmark' : 'Save bookmark'}
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveOpportunity(opportunity.canonicalOpportunityId);
            }}
            className={`p-2 rounded-xl border transition-all ${
              saved
                ? 'bg-violet-600 text-white border-violet-500'
                : 'bg-black/30 text-slate-400 hover:text-white border-white/5'
            }`}
            title={saved ? 'Remove saved' : 'Save bookmark'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>

          <span className="text-xs font-bold text-violet-400 group-hover:text-violet-300 flex items-center">
            Details →
          </span>
        </div>
      </div>
    );
  }

  // Grid View Rendering (Matching Elegant Dark HTML specification)
  return (
    <div
      onClick={() => setSelectedOpportunity(opportunity)}
      className="bg-[#0f0a1d] rounded-2xl p-6 border border-violet-500/10 hover:border-violet-500/30 transition-all relative group flex flex-col justify-between cursor-pointer"
    >
      {/* Match Score Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="bg-violet-500/20 text-violet-400 px-2 py-1 rounded text-[10px] font-bold tracking-tighter">
          {matchResult.totalScore}% MATCH
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveOpportunity(opportunity.canonicalOpportunityId);
          }}
          className={`p-1.5 rounded-lg border transition-all ${
            saved
              ? 'bg-violet-600 text-white border-violet-500'
              : 'bg-black/30 text-slate-400 hover:text-white border-white/5'
          }`}
          title={saved ? 'Remove bookmark' : 'Save bookmark'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Header Info: Icon & Category */}
      <div className="mb-4">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/5">
          <span className="text-xl">{icon}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-xs text-slate-400">{opportunity.organization}</span>
          {opportunity.verificationStatus === 'verified' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-violet-200 line-clamp-2 transition-colors">
          {opportunity.title}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>
      </div>

      {/* Inset Logistics Box (Funding & Deadline) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
          <p className="text-[10px] uppercase text-slate-500 mb-1">Funding</p>
          <p className={`text-xs truncate ${fundingDisplay.color}`} title={fundingDisplay.label}>
            {fundingDisplay.label}
          </p>
        </div>

        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
          <p className="text-[10px] uppercase text-slate-500 mb-1">Deadline</p>
          <p
            className={`text-xs font-semibold truncate ${
              deadlineInfo.status === 'closing_soon' || deadlineInfo.status === 'closing_today'
                ? 'text-orange-400'
                : 'text-slate-200'
            }`}
            title={deadlineInfo.label}
          >
            {deadlineInfo.label}
          </p>
        </div>
      </div>

      {/* Transparent Match Reason Snippet */}
      {matchResult.whyItMatches.length > 0 && (
        <div className="mb-4 pt-2 border-t border-violet-900/20 text-[11px] text-slate-400 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          <span className="line-clamp-1 text-slate-300">
            {matchResult.whyItMatches[0]}
          </span>
        </div>
      )}

      {/* Card Footer Strip: Eligibility Status & View Action */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center text-xs text-slate-400">
          {matchResult.isEligible ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0"></span>
              <span className="text-emerald-400 font-medium">Eligible</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 shrink-0"></span>
              <span className="text-amber-300 font-medium">Watchouts</span>
            </>
          )}
        </div>

        <button
          aria-label={`View details for ${opportunity.title}`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOpportunity(opportunity);
          }}
          className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
        >
          <span>View Details</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
};

