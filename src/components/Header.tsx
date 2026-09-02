import React from 'react';
import { Search, User, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { filters, updateFilter, setIsProfileOpen, setCurrentView } = useApp();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onToggleMobileSidebar} aria-label="Open navigation">
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
        <button onClick={() => setCurrentView('explore')} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#166534] text-sm font-bold text-white">P</span>
          <span className="text-lg font-bold tracking-tight text-slate-900">Pathlight</span>
        </button>
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <div className="flex w-full max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-[#f8f9fa] px-3 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search opportunities"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <button onClick={() => setIsProfileOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecfdf5] text-[#166534] ring-1 ring-[#bbf7d0] transition hover:bg-[#d1fae5]" aria-label="Open profile">
        <User className="h-5 w-5" />
      </button>
    </header>
  );
};