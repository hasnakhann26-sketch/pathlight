import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Search,
  LayoutGrid,
  List,
  Bookmark,
  Database,
  UploadCloud,
  User,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    filters,
    updateFilter,
    profile,
    setIsProfileOpen,
    setIsSourceRegistryOpen,
    setIsJsonImportOpen,
    savedOpportunityIds,
    viewMode,
    setViewMode,
  } = useApp();

  return (
    <header className="h-20 border-b border-violet-900/20 px-4 sm:px-8 flex items-center justify-between bg-[#050308]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-white/5"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
            P
          </div>
          <span className="font-bold text-white text-sm">Pathlight</span>
        </div>
      </div>

      {/* Global Search Input */}
      <div className="flex-1 max-w-2xl hidden md:flex items-center bg-slate-900/50 rounded-xl px-4 py-2.5 border border-white/5 focus-within:border-violet-500/50 transition-all">
        <span className="text-slate-500 mr-3">🔍</span>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          placeholder="Search opportunities (e.g. scholarships, DAAD, CERN, fully funded)..."
          className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-200 placeholder:text-slate-500 outline-none"
        />
        {filters.searchQuery && (
          <button
            onClick={() => updateFilter('searchQuery', '')}
            className="text-xs text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right Controls: View Mode & Action Badges */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Grid vs List View Toggle */}
        <div className="flex space-x-1 p-1 bg-slate-900 rounded-lg border border-white/5">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>

        {/* Saved List Quick Filter Toggle */}
        <button
          onClick={() => updateFilter('savedOnly', !filters.savedOnly)}
          className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
            filters.savedOnly
              ? 'bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-white/5 hover:bg-slate-800'
          }`}
          title="Toggle Saved Bookmarks"
        >
          <Bookmark className={`w-3.5 h-3.5 ${filters.savedOnly ? 'fill-violet-400 text-violet-400' : ''}`} />
          <span className="hidden sm:inline">Saved</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/40 text-violet-300 font-mono font-bold">
            {savedOpportunityIds.length}
          </span>
        </button>

        {/* Mobile Profile Trigger */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300"
          title="Open Profile Settings"
        >
          <User className="w-4 h-4 text-violet-400" />
        </button>
      </div>
    </header>
  );
};

