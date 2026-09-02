import React from 'react';
import { ArrowUpDown, Calendar, CheckCircle2, DollarSign, Globe2, RotateCcw, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category, FundingType, Modality } from '../types';

const TOP_CATEGORIES: Category[] = ['Scholarships', 'Fellowships', 'Research', 'Exchanges', 'Grants', 'Competitions', 'Hackathons', 'Internships', 'Conferences', 'MUN'];

export const FilterBar: React.FC = () => {
  const { filters, updateFilter, resetFilters, opportunities } = useApp();
  const sources = Array.from(new Set(opportunities.flatMap((opportunity) => opportunity.sources.map((source) => source.sourceName)))).sort();

  const toggle = <T,>(key: 'selectedCategories' | 'modalities' | 'fundingTypes', value: T) => {
    const current = filters[key] as T[];
    updateFilter(key, current.includes(value) ? current.filter((item) => item !== value) : [...current, value] as never);
  };

  const active = filters.searchQuery.trim() || filters.selectedCategories.length || filters.modalities.length || filters.fundingTypes.length || filters.deadlineFilter !== 'all' || filters.eligibleOnly || filters.worldwideOnly || filters.freeApplicationOnly || filters.savedOnly;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button onClick={() => updateFilter('selectedCategories', [])} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${filters.selectedCategories.length === 0 ? 'border-[#166534] bg-[#166534] text-white' : 'bg-white text-gray-600 hover:border-[#15803d] hover:text-[#166534]'}`}>All opportunities <span className="ml-1 text-[11px] opacity-70">{opportunities.length}</span></button>
        {TOP_CATEGORIES.map((category) => {
          const count = opportunities.filter((item) => item.category === category).length;
          if (!count) return null;
          const selected = filters.selectedCategories.includes(category);
          return <button key={category} onClick={() => toggle('selectedCategories', category)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${selected ? 'border-[#166534] bg-green-50 text-[#166534]' : 'bg-white text-gray-600 hover:border-[#15803d] hover:text-[#166534]'}`}>{category} <span className="ml-1 text-[11px] text-gray-400">{count}</span></button>;
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-white p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => updateFilter('eligibleOnly', !filters.eligibleOnly)} className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-medium ${filters.eligibleOnly ? 'border-green-200 bg-green-50 text-[#166534]' : 'text-gray-600 hover:bg-gray-50'}`}><CheckCircle2 className="h-3.5 w-3.5" />Eligible only</button>
          <button onClick={() => toggle('fundingTypes', 'fully_funded' as FundingType)} className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-medium ${filters.fundingTypes.includes('fully_funded') ? 'border-green-200 bg-green-50 text-[#166534]' : 'text-gray-600 hover:bg-gray-50'}`}><DollarSign className="h-3.5 w-3.5" />Fully funded</button>
          <button onClick={() => updateFilter('worldwideOnly', !filters.worldwideOnly)} className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-medium ${filters.worldwideOnly ? 'border-green-200 bg-green-50 text-[#166534]' : 'text-gray-600 hover:bg-gray-50'}`}><Globe2 className="h-3.5 w-3.5" />Worldwide / online</button>
          <div className="flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs text-gray-600"><Calendar className="h-3.5 w-3.5 text-gray-400" /><select value={filters.deadlineFilter} onChange={(e) => updateFilter('deadlineFilter', e.target.value as any)} className="bg-transparent outline-none"><option value="all">Any deadline</option><option value="closing_soon">Closing soon</option><option value="closing_this_month">This month</option><option value="no_deadline">No deadline</option></select></div>
          <select value={filters.source} onChange={(e) => updateFilter('source', e.target.value)} className="max-w-[170px] rounded border bg-white px-2.5 py-1.5 text-xs text-gray-600 outline-none focus:border-[#15803d]"><option value="">All sources</option>{sources.map((source) => <option key={source} value={source}>{source}</option>)}</select>
          <div className="hidden items-center rounded border p-0.5 text-xs sm:flex">{(['online', 'in-person', 'hybrid'] as Modality[]).map((modality) => <button key={modality} onClick={() => toggle('modalities', modality)} className={`rounded px-2 py-1 capitalize ${filters.modalities.includes(modality) ? 'bg-[#166534] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{modality}</button>)}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs text-gray-600"><ArrowUpDown className="h-3.5 w-3.5 text-gray-400" /><select value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value as any)} className="bg-transparent outline-none"><option value="best_match">Best match</option><option value="deadline_asc">Earliest deadline</option><option value="funding_high">Highest funding</option><option value="newest">Recently verified</option></select></div>
          {active && <button onClick={resetFilters} className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900"><RotateCcw className="h-3 w-3" />Reset</button>}
        </div>
      </div>
    </section>
  );
};