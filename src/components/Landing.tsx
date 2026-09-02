import React from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Landing: React.FC = () => {
  const { filters, updateFilter, setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#166534] text-lg font-bold text-white">P</span>
          <span className="text-xl font-bold tracking-tight text-slate-900">Pathlight</span>
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          Find Your Next Opportunity
        </h1>

        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          Discover fellowships, grants, essays, MUN, travel programs and more
        </p>

        <div className="mt-8 flex w-full max-w-2xl items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-slate-500" />
          <input
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search opportunities"
            className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setCurrentView('explore');
          }}
          className="mt-8 rounded-full bg-[#166534] px-7 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#14532d]"
        >
          Explore Opportunities
        </button>
      </div>
    </div>
  );
};
