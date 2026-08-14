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
    <section className="mb-8 bg-gradient-to-r from-violet-900/20 via-[#0a0514] to-transparent p-6 sm:p-7 rounded-2xl border border-violet-500/20 relative overflow-hidden transition-all">
      <div className="relative z-10">
        <div className="max-w-2xl mb-4">
          <span className="text-[10px] bg-violet-500/20 text-violet-400 font-bold px-2.5 py-1 rounded uppercase tracking-wider mb-2 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Discovery Engine</span>
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
            Discover beyond what you searched for
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Pathlight matches opportunities to your goals, not just your search query. You're looking at scholarships, fellowships, research, internships, and more — all aligned with your actual aspirations.
          </p>
        </div>

        {/* Suggestion Pathways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {(showAllCards ? goalSuggestions : goalSuggestions.slice(0, 3)).map((suggestion, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-4 rounded-xl bg-[#0f0a1d]/80 hover:bg-[#0f0a1d] border border-violet-500/10 hover:border-violet-500/30 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/20">
                    {suggestion.relatedCategory}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {suggestion.opportunityCount} options
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-2 font-normal">
                  {suggestion.reasonPhrase}
                </p>

                <div className="text-[11px] text-slate-400 mb-3">
                  Aligns with: <span className="text-slate-200 font-medium">"{suggestion.targetedGoal}"</span>
                </div>
              </div>

              <button
                onClick={() => setQuickCategory(suggestion.relatedCategory)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-violet-600/30 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/30 transition-all shadow-sm group-hover:shadow-violet-600/20"
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
            className="mt-4 text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>{showAllCards ? 'Show fewer pathways' : `Show all ${goalSuggestions.length} goal pathways`}</span>
            {showAllCards ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
    </section>
  );
};

