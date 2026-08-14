import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Bookmark,
  Database,
  UploadCloud,
  CheckCircle2,
  DollarSign,
  Globe,
  Sliders,
  User,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    profile,
    setIsProfileOpen,
    setIsSourceRegistryOpen,
    setIsJsonImportOpen,
    filters,
    updateFilter,
    savedOpportunityIds,
    stats,
  } = useApp();

  const handleToggleFunding = () => {
    if (filters.fundingTypes.includes('fully_funded')) {
      updateFilter(
        'fundingTypes',
        filters.fundingTypes.filter((f) => f !== 'fully_funded')
      );
    } else {
      updateFilter('fundingTypes', [...filters.fundingTypes, 'fully_funded']);
    }
  };

  return (
    <aside
      className={`${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } fixed lg:static inset-y-0 left-0 z-50 w-72 border-r border-violet-900/30 bg-[#0a0514] flex flex-col p-6 overflow-hidden transition-transform duration-200 ease-in-out shrink-0`}
    >
      {/* Brand Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-violet-600/30">
            P
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Pathlight</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 font-mono border border-violet-800/40">
                v2.0
              </span>
            </h1>
          </div>
        </div>

        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/50"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scrollable Navigation and Controls */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 -mr-1 scrollbar-none">
        {/* Verified Profile Card */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Verified Profile</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-medium">● Active</span>
          </div>

          <div className="space-y-2.5 bg-violet-950/20 p-4 rounded-xl border border-violet-500/10 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Age</span>
              <span className="font-medium text-slate-200">{profile.age} yrs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Location</span>
              <span className="font-medium text-slate-200 truncate max-w-[110px]" title={profile.country}>
                {profile.country}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Field</span>
              <span className="font-medium text-violet-300 truncate max-w-[110px]" title={profile.field}>
                {profile.field}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Education</span>
              <span className="font-medium text-slate-200">
                {profile.degree || profile.educationLevel} (Yr {profile.year})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Budget</span>
              <span className="font-medium text-emerald-400">
                ${profile.budget} {profile.budget === 0 ? '(Need 100% aid)' : ''}
              </span>
            </div>

            <button
              onClick={() => {
                setIsProfileOpen(true);
                if (setMobileOpen) setMobileOpen(false);
              }}
              className="w-full mt-2 py-2 text-xs font-semibold bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 shadow-sm"
            >
              Edit Profile Details
            </button>
          </div>
        </section>

        {/* Workspace Navigation */}
        <nav className="space-y-1">
          <h3 className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold mb-3">
            My Workspace
          </h3>

          {/* All Opportunities */}
          <button
            onClick={() => {
              updateFilter('savedOnly', false);
              if (setMobileOpen) setMobileOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
              !filters.savedOnly
                ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20 font-medium'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {!filters.savedOnly && <div className="w-1 h-4 bg-violet-500 rounded-full" />}
              <span className={`text-sm ${filters.savedOnly ? 'ml-4' : ''}`}>Opportunities</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-slate-400 font-mono">
              {stats.total}
            </span>
          </button>

          {/* Saved List */}
          <button
            onClick={() => {
              updateFilter('savedOnly', true);
              if (setMobileOpen) setMobileOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
              filters.savedOnly
                ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20 font-medium'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {filters.savedOnly && <div className="w-1 h-4 bg-violet-500 rounded-full" />}
              <span className={`text-sm ${!filters.savedOnly ? 'ml-4' : ''}`}>Saved List</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 font-mono font-bold">
              {savedOpportunityIds.length}
            </span>
          </button>

          {/* Connectors Registry */}
          <button
            onClick={() => {
              setIsSourceRegistryOpen(true);
              if (setMobileOpen) setMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center space-x-3 ml-4">
              <span className="text-sm">Connectors</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
              6 Active
            </span>
          </button>

          {/* Dataset Ingestion */}
          <button
            onClick={() => {
              setIsJsonImportOpen(true);
              if (setMobileOpen) setMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center space-x-3 ml-4">
              <span className="text-sm">Dataset JSON</span>
            </div>
            <span className="text-[10px] text-slate-500">Manage</span>
          </button>
        </nav>

        {/* Global Filters Section */}
        <section>
          <h3 className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold mb-3">
            Global Filters
          </h3>

          <div className="space-y-3 bg-[#0f0a1d]/60 p-3.5 rounded-xl border border-violet-500/10 text-xs">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  checked={filters.eligibleOnly}
                  onChange={(e) => updateFilter('eligibleOnly', e.target.checked)}
                  className="accent-violet-500 w-4 h-4 bg-slate-800 border-none rounded cursor-pointer"
                />
                <span className="text-sm text-slate-300 group-hover:text-white">Eligible Only</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">
                {stats.eligibleCount}
              </span>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  checked={filters.fundingTypes.includes('fully_funded')}
                  onChange={handleToggleFunding}
                  className="accent-violet-500 w-4 h-4 bg-slate-800 border-none rounded cursor-pointer"
                />
                <span className="text-sm text-slate-300 group-hover:text-white">Fully Funded</span>
              </div>
              <span className="text-[11px] text-violet-300 font-mono font-medium">
                {stats.fullyFundedCount}
              </span>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  checked={filters.worldwideOnly}
                  onChange={(e) => updateFilter('worldwideOnly', e.target.checked)}
                  className="accent-violet-500 w-4 h-4 bg-slate-800 border-none rounded cursor-pointer"
                />
                <span className="text-sm text-slate-300 group-hover:text-white">Worldwide / Online</span>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  checked={filters.freeApplicationOnly}
                  onChange={(e) => updateFilter('freeApplicationOnly', e.target.checked)}
                  className="accent-violet-500 w-4 h-4 bg-slate-800 border-none rounded cursor-pointer"
                />
                <span className="text-sm text-slate-300 group-hover:text-white">Free Application ($0)</span>
              </div>
            </label>
          </div>
        </section>
      </div>

      {/* Footer Profile Strip */}
      <div className="mt-auto pt-4 border-t border-violet-900/30">
        <button
          onClick={() => setIsProfileOpen(true)}
          className="w-full flex items-center space-x-3 p-2 rounded-xl hover:bg-violet-950/30 transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 border border-violet-400/30 flex items-center justify-center font-bold text-white shrink-0 shadow-sm">
            {profile.field.charAt(0)}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="text-sm font-semibold truncate text-white group-hover:text-violet-200">
              {profile.field} Scholar
            </p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>{profile.country}</span>
              <span>•</span>
              <span className="text-violet-400">Benchmark Active</span>
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};
