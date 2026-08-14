import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Category, Modality, FundingType } from '../types';
import { Sparkles, SendHorizonal, RotateCcw, CheckCircle2, Globe, DollarSign, Calendar, ArrowUpDown } from 'lucide-react';

const TOP_CATEGORIES: Category[] = [
  'Scholarships',
  'Fellowships',
  'Research',
  'Exchanges',
  'Grants',
  'Competitions',
  'Hackathons',
  'Internships',
  'Summer schools',
  'Conferences',
  'Leadership programs',
  'Travel-funded programs',
];

export const FilterBar: React.FC = () => {
  const { filters, updateFilter, resetFilters, opportunities, applyDiscoveryIntent, discoverySignals, clearDiscoveryIntent } = useApp();
  const [draft, setDraft] = useState('');

  const handleCategoryToggle = (cat: Category) => {
    if (filters.selectedCategories.includes(cat)) {
      updateFilter(
        'selectedCategories',
        filters.selectedCategories.filter((c) => c !== cat)
      );
    } else {
      updateFilter('selectedCategories', [...filters.selectedCategories, cat]);
    }
  };

  const handleModalityToggle = (mod: Modality) => {
    if (filters.modalities.includes(mod)) {
      updateFilter(
        'modalities',
        filters.modalities.filter((m) => m !== mod)
      );
    } else {
      updateFilter('modalities', [...filters.modalities, mod]);
    }
  };

  const handleFundingToggle = (fund: FundingType) => {
    if (filters.fundingTypes.includes(fund)) {
      updateFilter(
        'fundingTypes',
        filters.fundingTypes.filter((f) => f !== fund)
      );
    } else {
      updateFilter('fundingTypes', [...filters.fundingTypes, fund]);
    }
  };

  const isAnyFilterActive =
    filters.searchQuery.trim() !== '' ||
    filters.selectedCategories.length > 0 ||
    filters.country !== '' ||
    filters.worldwideOnly ||
    filters.modalities.length > 0 ||
    filters.fundingTypes.length > 0 ||
    filters.freeApplicationOnly ||
    filters.deadlineFilter !== 'all' ||
    filters.eligibleOnly ||
    filters.savedOnly ||
    filters.sortBy !== 'best_match';

  const handleDiscoverySubmit = () => {
    const prompt = draft.trim();
    if (!prompt) return;
    applyDiscoveryIntent(prompt);
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="rounded-2xl border border-violet-500/20 bg-[#0a0514]/90 p-3.5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Describe what you're looking for</span>
          </div>

          <div className="flex-1 flex items-center gap-2 rounded-xl border border-violet-500/20 bg-black/20 px-3 py-2 focus-within:border-violet-500/50">
            <input
              aria-label="Opportunity discovery prompt"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDiscoverySubmit();
                }
              }}
              placeholder="I want a fully funded opportunity abroad with research experience and no major requirement..."
              className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
            />
            <button
              type="button"
              aria-label="Apply opportunity discovery prompt"
              onClick={handleDiscoverySubmit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              <SendHorizonal className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
          </div>
        </div>

        <p className="mt-2 text-[11px] text-slate-400">
          Try prompts like “fully funded research abroad,” “summer internships in AI,” or “leadership programs with no major restriction.”
        </p>

        {discoverySignals && (
          <div className="mt-3 rounded-xl border border-violet-500/10 bg-[#120a1d]/80 px-3 py-2 text-xs text-slate-300">
            <div className="flex items-start justify-between gap-3">
              <p>{discoverySignals.summary}</p>
              {discoverySignals.noMajorRestriction && (
                <button
                  onClick={clearDiscoveryIntent}
                  className="shrink-0 text-[10px] uppercase tracking-wide text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">
              {discoverySignals.fundingTypes.length > 0 && (
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5">
                  Funding: {discoverySignals.fundingTypes.join(', ')}
                </span>
              )}
              {discoverySignals.categories.length > 0 && (
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5">
                  Intent: {discoverySignals.categories.join(', ')}
                </span>
              )}
              {discoverySignals.noMajorRestriction && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                  No major restriction
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Pills Slider / Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => updateFilter('selectedCategories', [])}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filters.selectedCategories.length === 0
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'bg-[#0f0a1d] text-slate-400 hover:text-slate-200 hover:bg-[#150e29] border border-violet-500/10'
          }`}
        >
          All Categories ({opportunities.length})
        </button>

        {TOP_CATEGORIES.map((cat) => {
          const isSelected = filters.selectedCategories.includes(cat);
          const count = opportunities.filter((o) => o.category === cat).length;
          if (count === 0) return null;

          return (
            <button
              key={cat}
              onClick={() => handleCategoryToggle(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 border border-violet-500'
                  : 'bg-[#0f0a1d] text-slate-300 hover:text-white hover:bg-[#150e29] border border-violet-500/10'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-violet-800 text-violet-100' : 'bg-black/40 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0514] border border-violet-900/30">
        {/* Left Side: Quick Status Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Eligible Only Toggle */}
          <button
            onClick={() => updateFilter('eligibleOnly', !filters.eligibleOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.eligibleOnly
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/5 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${filters.eligibleOnly ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Eligible Only</span>
          </button>

          {/* Fully Funded Toggle */}
          <button
            onClick={() => handleFundingToggle('fully_funded')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filters.fundingTypes.includes('fully_funded')
                ? 'bg-violet-950/70 text-violet-300 border-violet-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/5 hover:bg-slate-800'
            }`}
          >
            <DollarSign className={`w-3.5 h-3.5 ${filters.fundingTypes.includes('fully_funded') ? 'text-violet-400' : 'text-slate-500'}`} />
            <span>Fully Funded</span>
          </button>

          {/* Worldwide / Online Toggle */}
          <button
            onClick={() => updateFilter('worldwideOnly', !filters.worldwideOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filters.worldwideOnly
                ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/5 hover:bg-slate-800'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${filters.worldwideOnly ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span>Worldwide / Online</span>
          </button>

          {/* Modality Toggles */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-white/5 text-xs">
            {(['online', 'in-person', 'hybrid'] as Modality[]).map((mod) => {
              const active = filters.modalities.includes(mod);
              return (
                <button
                  key={mod}
                  onClick={() => handleModalityToggle(mod)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                    active ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mod}
                </button>
              );
            })}
          </div>

          {/* Deadline Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-white/5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.deadlineFilter}
              onChange={(e) => updateFilter('deadlineFilter', e.target.value as any)}
              className="bg-transparent text-slate-300 font-medium outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#0a0514] text-slate-200">
                All Deadlines
              </option>
              <option value="closing_soon" className="bg-[#0a0514] text-amber-300">
                Closing Soon (&lt; 7 days)
              </option>
              <option value="closing_this_month" className="bg-[#0a0514] text-violet-300">
                Closing This Month
              </option>
              <option value="opening_soon" className="bg-[#0a0514] text-sky-300">
                Opening Soon
              </option>
              <option value="no_deadline" className="bg-[#0a0514] text-slate-300">
                Rolling / No Deadline
              </option>
            </select>
          </div>
        </div>

        {/* Right Side: Sorting & Reset */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-white/5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as any)}
              className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer"
            >
              <option value="best_match" className="bg-[#0a0514] text-slate-200">
                Best Match Score
              </option>
              <option value="deadline_asc" className="bg-[#0a0514] text-slate-200">
                Earliest Deadline
              </option>
              <option value="funding_high" className="bg-[#0a0514] text-slate-200">
                Highest Funding
              </option>
              <option value="newest" className="bg-[#0a0514] text-slate-200">
                Recently Verified
              </option>
            </select>
          </div>

          {isAnyFilterActive && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-white/5"
              title="Reset all filters to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

