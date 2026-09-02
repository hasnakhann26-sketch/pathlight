import React from 'react';
import { Compass, LayoutGrid, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentView, setCurrentView, setIsProfileOpen } = useApp();

  return (
    <>
      {mobileOpen && <button className="fixed inset-0 z-40 bg-slate-900/10 lg:hidden" onClick={() => setMobileOpen?.(false)} aria-label="Close navigation" />}
      <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-5 transition-transform duration-200 lg:static`}>
        <div className="flex items-center justify-between pb-5">
          <button onClick={() => setCurrentView('explore')} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#166534] text-lg font-bold text-white">P</span>
            <span className="text-lg font-bold tracking-tight text-slate-900">Pathlight</span>
          </button>
          <button onClick={() => setMobileOpen?.(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close navigation">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          <button
            onClick={() => { setCurrentView('explore'); setMobileOpen?.(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${currentView === 'explore' ? 'bg-[#ecfdf5] text-[#166534]' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Compass className="h-4 w-4" />
            Explore
          </button>
          <button
            onClick={() => { setCurrentView('applications'); setMobileOpen?.(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${currentView === 'applications' ? 'bg-[#ecfdf5] text-[#166534]' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutGrid className="h-4 w-4" />
            My Applications
          </button>
          <button
            onClick={() => { setIsProfileOpen(true); setMobileOpen?.(false); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <User className="h-4 w-4" />
            Profile
          </button>
        </nav>
      </aside>
    </>
  );
};