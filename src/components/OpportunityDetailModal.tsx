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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-200/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white text-slate-800 overflow-hidden my-8 shadow-2xl shadow-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f8faf8] p-5 sm:p-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-lg border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {selectedOpportunity.category}
            </span>
            {selectedOpportunity.subcategory && (
              <span className="text-xs font-medium text-slate-500">
                {selectedOpportunity.subcategory}
              </span>
            )}
            <span className="text-gray-500">•</span>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Official Record</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveOpportunity(selectedOpportunity.canonicalOpportunityId)}
              className={`rounded-xl border p-2 transition-all ${
                saved
                  ? 'border-emerald-200 bg-emerald-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
              title={saved ? 'Saved' : 'Save opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => setSelectedOpportunity(null)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Title & Organization */}
          <div>
            <div className="text-sm font-semibold text-gray-500 mb-1">
              {selectedOpportunity.organization}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {selectedOpportunity.title}
            </h2>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Match Score
              </span>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-lg font-extrabold text-slate-900">
                  {matchResult.totalScore}%
                </span>
              </div>
            </div>

            {/* Funding */}
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                Funding
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold capitalize text-emerald-700">
                  {selectedOpportunity.funding.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Location
              </span>
              <div className="mt-0.5 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span className="truncate text-sm font-medium text-slate-700">
                  {selectedOpportunity.worldwide ? 'Worldwide' : selectedOpportunity.country}
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                Deadline Status
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-700">
                  {deadlineInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Transparent Match Scoring Breakdown */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Transparent Score Breakdown ({matchResult.totalScore}/100 pts)
                </h3>
              </div>
              <span className="text-xs text-gray-500 italic">
                Evaluated against active profile
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {matchResult.matchSummary}
            </p>

            {/* Factors Bar Breakdown */}
            <div className="space-y-2.5 pt-2">
              {matchResult.factors.map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{factor.name}</span>
                    <span className="font-mono text-gray-600">
                      <strong>{factor.score}</strong> / {factor.maxScore} pts
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                      style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-gray-500">{factor.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Deterministic Eligibility Matrix */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
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
                    <div key={i} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                      <div className="font-medium text-emerald-300">{req.criterion}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        Required: <span className="text-gray-700">{req.requiredValue}</span>
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        Your Profile: <span className="text-emerald-700 font-semibold">{req.userValue}</span>
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
                    <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                      <div className="font-medium text-amber-300">{req.criterion}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        Required: <span className="text-amber-700">{req.requiredValue}</span>
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        Your Profile: <span className="text-gray-700">{req.userValue}</span>
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
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Program Overview</span>
              <p className="text-sm leading-relaxed text-slate-700">{selectedOpportunity.description}</p>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Financial & Travel Support</span>
              <ul className="space-y-1 text-slate-700">
                <li>• <strong>Funding Model:</strong> {selectedOpportunity.funding.replace('_', ' ')}</li>
                {selectedOpportunity.stipend && <li>• <strong>Stipend:</strong> {selectedOpportunity.stipend}</li>}
                {selectedOpportunity.prize && <li>• <strong>Prize / Award:</strong> {selectedOpportunity.prize}</li>}
                <li>• <strong>Travel Support:</strong> {selectedOpportunity.travelSupport ? 'Yes (Flight Covered)' : 'Not Specified / None'}</li>
                <li>• <strong>Accommodation:</strong> {selectedOpportunity.accommodationSupport ? 'Yes (Provided / Subsidized)' : 'Self-Arranged'}</li>
                <li>• <strong>Application Fee:</strong> {selectedOpportunity.applicationFee === 0 || !selectedOpportunity.applicationFee ? 'Free ($0)' : `$${selectedOpportunity.applicationFee}`}</li>
              </ul>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600"><Calendar className="w-3.5 h-3.5 text-emerald-600" /> Timeline & Schedule</span>
              <ul className="space-y-1 text-slate-700">
                <li>• <strong>Application Deadline:</strong> {selectedOpportunity.deadline || 'Rolling / Open'}</li>
                {selectedOpportunity.openingDate && <li>• <strong>Applications Open:</strong> {selectedOpportunity.openingDate}</li>}
                {selectedOpportunity.startDate && <li>• <strong>Program Start:</strong> {selectedOpportunity.startDate}</li>}
                {selectedOpportunity.duration && <li>• <strong>Duration:</strong> {selectedOpportunity.duration}</li>}
                <li>• <strong>Modality:</strong> {selectedOpportunity.modality}</li>
              </ul>
            </div>

            {selectedOpportunity.requiredDocuments && selectedOpportunity.requiredDocuments.length > 0 && (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600"><FileText className="w-3.5 h-3.5 text-emerald-600" /> Required Documents & Submission Materials</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedOpportunity.requiredDocuments.map((doc, i) => (
                    <span key={i} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700">✓ {doc}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Source Transparency & Provenance */}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <span>Source Provenance & Anti-Duplication Transparency</span>
              </span>
              <span className="text-gray-500 font-mono text-[11px]">
                ID: {selectedOpportunity.canonicalOpportunityId}
              </span>
            </div>

            <div className="text-gray-600 leading-relaxed">
              Pathlight indexes and verifies official opportunity sources directly. Last verified: <strong>{selectedOpportunity.lastVerified}</strong>.
            </div>

            {selectedOpportunity.duplicateNotes && (
              <div className="text-[11px] text-gray-500 italic">
                Note: {selectedOpportunity.duplicateNotes}
              </div>
            )}

            <div className="pt-2 space-y-1.5">
              {selectedOpportunity.sources.map((src, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-200">{src.sourceName}</span>
                    <span className="text-slate-500 ml-1.5 capitalize">({src.sourceType.replace('_', ' ')})</span>
                  </div>
                  <a
                    href={src.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1 text-emerald-700 underline hover:text-emerald-800"
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
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-[#f8faf8] p-5 sm:flex-row sm:p-6">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            <span>Official Portal Routing. Pathlight never charges fees or takes application cuts.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={selectedOpportunity.officialSourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:flex-initial"
            >
              <span>Official Info</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={selectedOpportunity.applicationUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 sm:flex-initial"
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

