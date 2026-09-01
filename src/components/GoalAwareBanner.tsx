import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

export const GoalAwareBanner: React.FC = () => {
  const { goalSuggestions, setQuickCategory, profile } = useApp();
  const [showAllCards, setShowAllCards] = useState(false);

  if (!goalSuggestions || goalSuggestions.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-7 relative overflow-hidden transition-all">
      <div className="relative z-10">
        <div className="max-w-2xl mb-4">
          <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <Sparkles className="w-3 h-3" />
            <span>Discovery Engine</span>
          </span>

          <h2 className="mb-2 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            You didn't know these existed
          </h2>

          <p className="text-sm leading-relaxed text-slate-600">
            Pathlight identifies cross-discipline opportunities for{' '}
            <span className="font-semibold text-emerald-700">{profile.field}</span>{' '}
            scholars that don't appear in traditional scholarship directories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {(showAllCards ? goalSuggestions : goalSuggestions.slice(0, 3)).map((suggestion, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all group hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-md border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    {suggestion.relatedCategory}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {suggestion.opportunityCount} options
                  </span>
                </div>

                <p className="mb-2 text-xs leading-relaxed text-slate-600 line-clamp-2 font-normal">
                  {suggestion.reasonPhrase}
                </p>

                <div className="mb-3 text-[11px] text-slate-500">
                  Aligns with: <span className="font-medium text-slate-700">"{suggestion.targetedGoal}"</span>
                </div>
              </div>

              <button
                onClick={() => setQuickCategory(suggestion.relatedCategory)}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-500"
              >
                <span>Explore {suggestion.relatedCategory}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>

        {goalSuggestions.length > 3 && (
          <button
            onClick={() => setShowAllCards(!showAllCards)}
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>{showAllCards ? 'Show fewer pathways' : `Show all ${goalSuggestions.length} goal pathways`}</span>
            {showAllCards ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-100 blur-3xl pointer-events-none"></div>
    </section>
  );
};

