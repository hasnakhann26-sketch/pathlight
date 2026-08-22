import React from 'react';
import { Bookmark, LayoutGrid, List, Menu, Search, User, BriefcaseBusiness } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    filters,
    updateFilter,
    profile,
    setIsProfileOpen,
    savedOpportunityIds,
    applications,
    activeView,
    setActiveView,
    viewMode,
    setViewMode,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between gap-4 border-b bg-white px-4 sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <button onClick={onToggleMobileSidebar} className="rounded-md p-2 text-gray-600 hover:bg-gray-100" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-[#166534] text-sm font-bold text-white">P</span>
          Pathlight
        </div>
      </div>

      <div className="hidden flex-1 items-center gap-2 md:flex">
        <div className="flex w-full max-w-xl items-center gap-2 rounded-md border bg-[#f8f9fa] px-3 py-2 focus-within:border-[#15803d] focus-within:bg-white">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search opportunities, organizations, or skills"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
          />
        </div>
      </div>

      <nav className="flex items-center gap-1 sm:gap-4">
        <button
          onClick={() => setActiveView('opportunities')}
          className={`hidden px-2 py-2 text-sm font-medium transition-colors sm:block ${activeView === 'opportunities' ? 'text-[#166534]' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveView('applications')}
          className={`flex items-center gap-1.5 px-2 py-2 text-sm font-medium transition-colors ${activeView === 'applications' ? 'text-[#166534]' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <BriefcaseBusiness className="h-4 w-4" />
          <span className="hidden sm:inline">My Applications</span>
          <span className="rounded-full bg-gray-100 px-1.5 text-[11px] text-gray-600">{Object.keys(applications).length}</span>
        </button>
        <button
          onClick={() => updateFilter('savedOnly', !filters.savedOnly)}
          className={`flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-colors ${filters.savedOnly ? 'bg-green-50 text-[#166534]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          <Bookmark className={`h-4 w-4 ${filters.savedOnly ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Saved</span>
          <span className="text-[11px]">{savedOpportunityIds.length}</span>
        </button>
        <div className="hidden items-center gap-1 border-l pl-3 lg:flex">
          <button onClick={() => setViewMode('grid')} className={`rounded p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-[#166534]' : 'text-gray-500'}`} aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`rounded p-2 ${viewMode === 'list' ? 'bg-gray-100 text-[#166534]' : 'text-gray-500'}`} aria-label="List view">
            <List className="h-4 w-4" />
          </button>
        </div>
        <button onClick={() => setIsProfileOpen(true)} className="ml-1 flex items-center gap-2 rounded-md p-1.5 text-gray-600 hover:bg-gray-100" aria-label="Open profile">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-[#166534]">{profile.field.charAt(0)}</span>
          <span className="hidden text-sm font-medium text-gray-800 xl:inline">{profile.field}</span>
          <User className="hidden h-4 w-4 xl:block" />
        </button>
      </nav>
    </header>
  );
};