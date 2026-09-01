import React from 'react';
import { Bookmark, Check, ChevronDown, Compass, Database, Filter, Globe2, SlidersHorizontal, Sparkles, UploadCloud, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

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
    applications,
    currentView,
    setCurrentView,
  } = useApp();

  const toggleFunding = () => {
    updateFilter('fundingTypes', filters.fundingTypes.includes('fully_funded') ? [] : ['fully_funded']);
  };

  return (
    <>
      {mobileOpen && <button className="fixed inset-0 z-40 bg-gray-200/60 lg:hidden" onClick={() => setMobileOpen?.(false)} aria-label="Close navigation" />}
      <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r bg-white px-5 py-5 transition-transform duration-200 lg:static`}>
        <div className="flex items-center justify-between border-b pb-5">
          <button onClick={() => setCurrentView('explore')} className="flex items-center gap-2.5 text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-[#166534] text-lg font-bold text-white">P</span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-gray-900">Pathlight</span>
              <span className="block text-[11px] text-gray-500">Find your next opportunity</span>
            </span>
          </button>
          <button onClick={() => setMobileOpen?.(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-5">
          <nav className="space-y-1">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Workspace</p>
            <button onClick={() => { setCurrentView('explore'); updateFilter('savedOnly', false); setMobileOpen?.(false); }} className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm ${currentView === 'explore' && !filters.savedOnly ? 'bg-green-50 font-semibold text-[#166534]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="flex items-center gap-3"><Compass className="h-4 w-4" />Discover opportunities</span>
              <span className="text-xs text-gray-500">{stats.total}</span>
            </button>
            <button onClick={() => { setCurrentView('applications'); setMobileOpen?.(false); }} className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm ${currentView === 'applications' ? 'bg-green-50 font-semibold text-[#166534]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="flex items-center gap-3"><Check className="h-4 w-4" />My Applications</span>
              <span className="text-xs text-gray-500">{applications.length}</span>
            </button>
            <button onClick={() => { setCurrentView('explore'); updateFilter('savedOnly', true); setMobileOpen?.(false); }} className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm ${filters.savedOnly ? 'bg-green-50 font-semibold text-[#166534]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="flex items-center gap-3"><Bookmark className="h-4 w-4" />Saved opportunities</span>
              <span className="text-xs text-gray-500">{savedOpportunityIds.length}</span>
            </button>
          </nav>

          <section className="mt-8">
            <div className="mb-3 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500"><Filter className="h-3.5 w-3.5" />Filters</div>
            <div className="space-y-3 rounded-md border bg-[#f8f9fa] p-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-gray-700">
                <span>Eligible for me</span><input type="checkbox" checked={filters.eligibleOnly} onChange={(e) => updateFilter('eligibleOnly', e.target.checked)} className="h-4 w-4 accent-[#16a34a]" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-gray-700">
                <span>Fully funded</span><input type="checkbox" checked={filters.fundingTypes.includes('fully_funded')} onChange={toggleFunding} className="h-4 w-4 accent-[#16a34a]" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-gray-700">
                <span>Worldwide / online</span><input type="checkbox" checked={filters.worldwideOnly} onChange={(e) => updateFilter('worldwideOnly', e.target.checked)} className="h-4 w-4 accent-[#16a34a]" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-gray-700">
                <span>Free application</span><input type="checkbox" checked={filters.freeApplicationOnly} onChange={(e) => updateFilter('freeApplicationOnly', e.target.checked)} className="h-4 w-4 accent-[#16a34a]" />
              </label>
              <label className="block text-sm text-gray-700">
                <span className="mb-1.5 block">Deadline</span>
                <select value={filters.deadlineFilter} onChange={(e) => updateFilter('deadlineFilter', e.target.value as any)} className="w-full rounded border bg-white px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-[#15803d]">
                  <option value="all">Any deadline</option><option value="closing_soon">Closing within 7 days</option><option value="closing_this_month">Closing this month</option><option value="no_deadline">Rolling / no deadline</option>
                </select>
              </label>
            </div>
          </section>

          <section className="mt-8">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Manage data</p>
            <button onClick={() => setIsSourceRegistryOpen(true)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"><Database className="h-4 w-4" />Connector registry</button>
            <button onClick={() => setIsJsonImportOpen(true)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"><UploadCloud className="h-4 w-4" />Import dataset</button>
          </section>
        </div>

        <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 border-t pt-4 text-left hover:bg-gray-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-semibold text-[#166534]">{profile.field.charAt(0)}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-gray-800">{profile.field} Scholar</span><span className="block truncate text-xs text-gray-500">{profile.country} · Edit profile</span></span>
          <User className="h-4 w-4 text-gray-400" />
        </button>
      </aside>
    </>
  );
};