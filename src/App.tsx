import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { ApplicationsPage } from './components/ApplicationsPage';
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { Compass } from 'lucide-react';

const MainView: React.FC = () => {
  const { filteredOpportunities, rssStatus, currentView, viewMode, resetFilters } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (currentView === 'landing') {
    return <Landing />;
  }

  if (currentView === 'applications') {
    return (
      <div className="min-h-screen bg-[#f5f5f3] text-slate-900">
        <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
        <div className="min-h-screen lg:pl-72">
          <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <ApplicationsPage />
          </main>
        </div>
        <OpportunityDetailModal />
        <ProfileModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-slate-900">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      <div className="min-h-screen lg:pl-72">
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#166534]">Explore</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Find Your Next Opportunity</h1>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
              <span className="font-bold text-slate-900">{filteredOpportunities.length}</span> loaded
            </div>
          </div>

          {rssStatus.isLoading && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <span>Loading opportunities...</span>
            </div>
          )}

          <div className="mb-6">
            <FilterBar />
          </div>

          {filteredOpportunities.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
              {filteredOpportunities.map(({ opportunity, matchResult }) => (
                <OpportunityCard key={opportunity.canonicalOpportunityId} opportunity={opportunity} matchResult={matchResult} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Compass className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">No opportunities match your filters</h2>
              <p className="mt-2 text-sm text-slate-600">Try clearing a filter or resetting the list.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-lg bg-[#166534] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#14532d]"
              >
                Reset filters
              </button>
            </div>
          )}
        </main>
      </div>

      <OpportunityDetailModal />
      <ProfileModal />
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

