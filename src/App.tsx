import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { ApplicationsPage } from './components/ApplicationsPage';
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { SourceRegistryModal } from './components/SourceRegistryModal';
import { JsonImportModal } from './components/JsonImportModal';
import { Compass, RotateCcw, Search, ShieldCheck } from 'lucide-react';

const MainView: React.FC = () => {
  const {
    filteredOpportunities,
    profile,
    filters,
    resetFilters,
    currentView,
    viewMode,
    setIsProfileOpen,
    setIsSourceRegistryOpen,
    setIsJsonImportOpen,
  } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (currentView === 'landing') {
    return (
      <div className="flex h-screen w-full bg-[#f5f7f2] text-slate-900 font-sans overflow-hidden selection:bg-emerald-600 selection:text-white">
        <div className="fixed inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-100/80 to-transparent pointer-events-none" />
        <Landing />
      </div>
    );
  }

  if (currentView === 'applications') {
    return (
      <div className="flex h-screen w-full bg-[#f5f7f2] text-slate-900 font-sans overflow-hidden selection:bg-emerald-600 selection:text-white">
        <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f5f7f2]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ApplicationsPage />
            </div>
          </div>
        </div>
        <OpportunityDetailModal />
        <ProfileModal />
        <SourceRegistryModal />
        <JsonImportModal />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f5f7f2] text-slate-900 font-sans overflow-hidden selection:bg-emerald-600 selection:text-white">
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-200/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-lime-200/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f5f7f2]">
          <StatsBar />

          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Explore Opportunities</h2>
                <p className="text-sm text-slate-600">Discover the programs that best match your goals, profile, and timeline.</p>
              </div>
              <FilterBar />
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900">
                  {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'Opportunity' : 'Opportunities'} Found
                </span>
                {filters.eligibleOnly && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
                    Showing Eligible Only
                  </span>
                )}
                {filters.savedOnly && (
                  <span className="px-2 py-0.5 rounded-md bg-lime-100 text-lime-700 border border-lime-200 font-medium">
                    Showing Saved Bookmarks
                  </span>
                )}
              </div>

              <div className="text-slate-500 hidden sm:block text-xs">
                Ranked for {profile.field} ({profile.educationLevel}, Year {profile.year})
              </div>
            </div>

            {filteredOpportunities.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredOpportunities.map(({ opportunity, matchResult }) => (
                  <OpportunityCard key={opportunity.canonicalOpportunityId} opportunity={opportunity} matchResult={matchResult} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm my-8 space-y-4">
                <div className="inline-flex p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No matching opportunities found</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your current filters are narrowing the list too far. Try clearing one constraint or broadening the funding and location filters.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </main>

          <footer className="mt-16 border-t border-slate-200 bg-[#f5f7f2] py-8 text-xs text-slate-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900">Pathlight</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[11px] text-slate-500">Opportunity discovery for students and early-career professionals</span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <button onClick={() => setIsSourceRegistryOpen(true)} className="text-slate-600 hover:text-emerald-700 transition-colors">Trusted Sources</button>
                  <button onClick={() => setIsJsonImportOpen(true)} className="text-slate-600 hover:text-emerald-700 transition-colors">Import Data</button>
                  <button onClick={() => setIsProfileOpen(true)} className="text-slate-600 hover:text-emerald-700 transition-colors">My Profile</button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                <p>Pathlight indexes and verifies official sources before surfacing matches; you apply directly on the host portal.</p>
                <div className="flex items-center gap-1 text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Opportunity Engine</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

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
