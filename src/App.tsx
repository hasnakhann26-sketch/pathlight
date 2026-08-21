import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { GoalAwareBanner } from './components/GoalAwareBanner';
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { SourceRegistryModal } from './components/SourceRegistryModal';
import { JsonImportModal } from './components/JsonImportModal';
import {
  Compass,
  Search,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

const MainView: React.FC = () => {
  const {
    filteredOpportunities,
    filters,
    resetFilters,
    profile,
    viewMode,
    setIsProfileOpen,
    setIsSourceRegistryOpen,
    setIsJsonImportOpen,
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#050308] text-slate-200 font-sans overflow-hidden selection:bg-violet-600 selection:text-white">
      {/* Background Decorative Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Live Profile Signals Strip */}
          <StatsBar />

          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Goal-Aware Discovery Banner */}
            <GoalAwareBanner />

            {/* Search & Filter Controls */}
            <FilterBar />

            {/* Results Context Strip */}
            <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'Opportunity' : 'Opportunities'} Found
                </span>
                {filters.eligibleOnly && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-medium">
                    Showing Eligible Only
                  </span>
                )}
                {filters.savedOnly && (
                  <span className="px-2 py-0.5 rounded-md bg-violet-950/80 text-violet-300 border border-violet-500/30 font-medium">
                    Showing Saved Bookmarks
                  </span>
                )}
              </div>

              <div className="text-slate-500 hidden sm:block">
                Ranked deterministically for {profile.field} ({profile.educationLevel}, Year {profile.year})
              </div>
            </div>

            {/* Opportunities List or Grid */}
            {filteredOpportunities.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredOpportunities.map(({ opportunity, matchResult }) => (
                  <OpportunityCard
                    key={opportunity.canonicalOpportunityId}
                    opportunity={opportunity}
                    matchResult={matchResult}
                  />
                ))}
              </div>
            ) : (
              /* Empty Filter State */
              <div className="p-12 text-center rounded-3xl bg-[#0a0514] border border-violet-500/10 my-8 space-y-4">
                <div className="inline-flex p-4 rounded-2xl bg-slate-900 text-slate-400 border border-white/5">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No matching opportunities found</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    No opportunities met all your current filter criteria. Try clearing some filters or loosening your eligibility constraints.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-violet-600/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="mt-16 border-t border-violet-900/20 bg-[#050308] py-8 text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-200">Pathlight Discovery Platform</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-[11px] text-slate-500">
                    Ages 15+ Personalized Opportunity Engine
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <button
                    onClick={() => setIsSourceRegistryOpen(true)}
                    className="text-slate-400 hover:text-violet-300 transition-colors"
                  >
                    Connector Registry
                  </button>
                  <button
                    onClick={() => setIsJsonImportOpen(true)}
                    className="text-slate-400 hover:text-violet-300 transition-colors"
                  >
                    JSON Importer
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="text-slate-400 hover:text-violet-300 transition-colors"
                  >
                    Active Profile
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                <p>
                  Pathlight indexes and verifies official opportunity sources directly. All applications are submitted on host portals.
                </p>
                <div className="flex items-center gap-1 text-emerald-400/80">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Deterministic Eligibility Engine</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Modals */}
      <OpportunityDetailModal />
      <ProfileModal />
      <SourceRegistryModal />
      <JsonImportModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainView />
    </AppProvider>
  );
}

