import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateMatchScore, calculateDeadlineStatus } from '../engine/matchingEngine';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

export const OpportunityDetailModal: React.FC = () => {
  const { selectedOpportunity, setSelectedOpportunity, profile, toggleSaveOpportunity, isSaved } = useApp();

  if (!selectedOpportunity) return null;

  const matchResult = calculateMatchScore(selectedOpportunity, profile);
  const deadlineInfo = calculateDeadlineStatus(selectedOpportunity.deadline, selectedOpportunity.openingDate);
  const saved = isSaved(selectedOpportunity.canonicalOpportunityId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-[#0a0514] border border-violet-500/20 shadow-2xl shadow-violet-950/50 text-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-violet-900/30 bg-[#050308]/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/20">
              {selectedOpportunity.category}
            </span>
            {selectedOpportunity.subcategory && (
              <span className="text-xs text-slate-400 font-medium">
                {selectedOpportunity.subcategory}
              </span>
            )}
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Official Record</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveOpportunity(selectedOpportunity.canonicalOpportunityId)}
              className={`p-2 rounded-xl border transition-all ${
                saved
                  ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-white/5 hover:bg-slate-800'
              }`}
              title={saved ? 'Saved' : 'Save opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => setSelectedOpportunity(null)}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Title & Organization */}
          <div>
            <div className="text-sm font-semibold text-slate-400 mb-1">
              {selectedOpportunity.organization}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              {selectedOpportunity.title}
            </h2>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#0f0a1d] border border-violet-500/10">
            {/* Match Score */}
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Match Score
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-lg font-extrabold text-white">
                  {matchResult.totalScore}%
                </span>
              </div>
            </div>

            {/* Funding */}
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Funding
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold capitalize text-emerald-300">
                  {selectedOpportunity.funding.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Location
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-200 truncate">
                  {selectedOpportunity.worldwide ? 'Worldwide' : selectedOpportunity.country}
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Deadline Status
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-300">
                  {deadlineInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Transparent Match Scoring Breakdown */}
          <div className="p-5 rounded-2xl bg-[#0f0a1d] border border-violet-500/20 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-violet-200">
                  Transparent Score Breakdown ({matchResult.totalScore}/100 pts)
                </h3>
              </div>
              <span className="text-xs text-slate-400 italic">
                Evaluated against active profile
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {matchResult.matchSummary}
            </p>

            {/* Factors Bar Breakdown */}
            <div className="space-y-2.5 pt-2">
              {matchResult.factors.map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{factor.name}</span>
                    <span className="font-mono text-slate-300">
                      <strong>{factor.score}</strong> / {factor.maxScore} pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300"
                      style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400">{factor.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Deterministic Eligibility Matrix */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-violet-400" />
              <span>Eligibility Evaluation Matrix</span>
            </h3>

            {/* Matched Requirements Checklist */}
            {matchResult.eligibility.matchedRequirements.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Matched Requirements ({matchResult.eligibility.matchedRequirements.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {matchResult.eligibility.matchedRequirements.map((req, i) => (
                    <div key={i} className="p-2 rounded-lg bg-[#0a0514] border border-emerald-900/40">
                      <div className="font-medium text-emerald-300">{req.criterion}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Required: <span className="text-slate-200">{req.requiredValue}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Your Profile: <span className="text-emerald-400 font-semibold">{req.userValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed or Watchout Requirements */}
            {matchResult.eligibility.failedRequirements.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-2">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Eligibility Watchouts / Constraints ({matchResult.eligibility.failedRequirements.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {matchResult.eligibility.failedRequirements.map((req, i) => (
                    <div key={i} className="p-2 rounded-lg bg-[#0a0514] border border-amber-900/50">
                      <div className="font-medium text-amber-300">{req.criterion}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Required: <span className="text-amber-200">{req.requiredValue}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Your Profile: <span className="text-slate-300">{req.userValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Opportunity Details & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Description & Overview */}
            <div className="p-4 rounded-xl bg-[#0f0a1d] border border-violet-500/10 space-y-2 sm:col-span-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Program Overview
              </span>
              <p className="text-slate-300 leading-relaxed text-sm">
                {selectedOpportunity.description}
              </p>
            </div>

            {/* Financial Support Breakdown */}
            <div className="p-4 rounded-xl bg-[#0f0a1d] border border-violet-500/10 space-y-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Financial & Travel Support</span>
              </span>
              <ul className="space-y-1 text-slate-300">
                <li>• <strong>Funding Model:</strong> {selectedOpportunity.funding.replace('_', ' ')}</li>
                {selectedOpportunity.stipend && <li>• <strong>Stipend:</strong> {selectedOpportunity.stipend}</li>}
                {selectedOpportunity.prize && <li>• <strong>Prize / Award:</strong> {selectedOpportunity.prize}</li>}
                <li>• <strong>Travel Support:</strong> {selectedOpportunity.travelSupport ? 'Yes (Flight Covered)' : 'Not Specified / None'}</li>
                <li>• <strong>Accommodation:</strong> {selectedOpportunity.accommodationSupport ? 'Yes (Provided / Subsidized)' : 'Self-Arranged'}</li>
                <li>• <strong>Application Fee:</strong> {selectedOpportunity.applicationFee === 0 || !selectedOpportunity.applicationFee ? 'Free ($0)' : `$${selectedOpportunity.applicationFee}`}</li>
              </ul>
            </div>

            {/* Timeline & Dates */}
            <div className="p-4 rounded-xl bg-[#0f0a1d] border border-violet-500/10 space-y-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Timeline & Schedule</span>
              </span>
              <ul className="space-y-1 text-slate-300">
                <li>• <strong>Application Deadline:</strong> {selectedOpportunity.deadline || 'Rolling / Open'}</li>
                {selectedOpportunity.openingDate && <li>• <strong>Applications Open:</strong> {selectedOpportunity.openingDate}</li>}
                {selectedOpportunity.startDate && <li>• <strong>Program Start:</strong> {selectedOpportunity.startDate}</li>}
                {selectedOpportunity.duration && <li>• <strong>Duration:</strong> {selectedOpportunity.duration}</li>}
                <li>• <strong>Modality:</strong> {selectedOpportunity.modality}</li>
              </ul>
            </div>

            {/* Required Documents */}
            {selectedOpportunity.requiredDocuments && selectedOpportunity.requiredDocuments.length > 0 && (
              <div className="p-4 rounded-xl bg-[#0f0a1d] border border-violet-500/10 space-y-2 sm:col-span-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-violet-400" />
                  <span>Required Documents & Submission Materials</span>
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedOpportunity.requiredDocuments.map((doc, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-200">
                      ✓ {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Source Transparency & Provenance */}
          <div className="p-4 rounded-xl bg-[#0f0a1d] border border-violet-500/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Source Provenance & Anti-Duplication Transparency</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                ID: {selectedOpportunity.canonicalOpportunityId}
              </span>
            </div>

            <div className="text-slate-400 leading-relaxed">
              Pathlight indexes and verifies official opportunity sources directly. Last verified: <strong>{selectedOpportunity.lastVerified}</strong>.
            </div>

            {selectedOpportunity.duplicateNotes && (
              <div className="text-[11px] text-slate-400 italic">
                Note: {selectedOpportunity.duplicateNotes}
              </div>
            )}

            <div className="pt-2 space-y-1.5">
              {selectedOpportunity.sources.map((src, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5 text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-200">{src.sourceName}</span>
                    <span className="text-slate-500 ml-1.5 capitalize">({src.sourceType.replace('_', ' ')})</span>
                  </div>
                  <a
                    href={src.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-violet-400 hover:text-violet-300 underline flex items-center gap-1"
                  >
                    <span>View Provenance</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-violet-900/30 bg-[#050308]/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>Official Portal Routing. Pathlight never charges fees or takes application cuts.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={selectedOpportunity.officialSourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Official Info</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={selectedOpportunity.applicationUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

