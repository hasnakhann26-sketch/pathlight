import React, { useState } from 'react';
import { Download, RefreshCw, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { SourceRegistryModal } from './components/SourceRegistryModal';
import { JsonImportModal } from './components/JsonImportModal';

const MainView: React.FC = () => {
  const {
    filteredOpportunities,
    scoredOpportunities,
    applications,
    activeView,
    profile,
    setIsProfileOpen,
    filters,
    updateFilter,
    aggregator,
  } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const applicationOpportunities = scoredOpportunities.filter(({ opportunity }) => applications[opportunity.canonicalOpportunityId]);
  const displayedOpportunities = activeView === 'applications' ? applicationOpportunities : filteredOpportunities;
  const now = Date.now();
  const withinDays = (date?: string, days = 7) => date ? new Date(date).getTime() >= now && new Date(date).getTime() <= now + days * 86400000 : false;
  const sections = activeView === 'opportunities' ? [
    { title: 'Closing This Week', items: filteredOpportunities.filter(({ opportunity }) => withinDays(opportunity.deadline, 7)), accent: 'text-red-600' },
    { title: 'Closing This Month', items: filteredOpportunities.filter(({ opportunity }) => withinDays(opportunity.deadline, 30)), accent: 'text-gray-900' },
    { title: 'New This Week', items: filteredOpportunities.filter(({ opportunity }) => withinDays(opportunity.lastVerified, 7)), accent: 'text-gray-900' },
    { title: 'Fellowships', items: filteredOpportunities.filter(({ opportunity }) => opportunity.category.toLowerCase().includes('fellowship')), accent: 'text-gray-900' },
    { title: 'Fully Funded Travel', items: filteredOpportunities.filter(({ opportunity }) => opportunity.funding === 'fully_funded' && /travel|exchange|conference|summit/i.test(`${opportunity.category} ${opportunity.title}`)), accent: 'text-gray-900' },
    { title: 'Essays and Writing', items: filteredOpportunities.filter(({ opportunity }) => opportunity.category === 'Essay / Writing'), accent: 'text-gray-900' },
    { title: 'MUN Conferences', items: filteredOpportunities.filter(({ opportunity }) => opportunity.category === 'MUN'), accent: 'text-gray-900' },
    { title: 'Competitions and Hackathons', items: filteredOpportunities.filter(({ opportunity }) => opportunity.category === 'Competition / Hackathon'), accent: 'text-gray-900' },
  ].filter((section) => section.items.length > 0) : [];

  const exportApplicationsCsv = () => {
    const rows = [['Title', 'Source', 'Status', 'Applied At', 'Deadline', 'Notes']];
    applicationOpportunities.forEach(({ opportunity }) => {
      const record = applications[opportunity.canonicalOpportunityId];
      rows.push([opportunity.title, opportunity.sources[0]?.sourceName || opportunity.organization, record.status, record.appliedAt, opportunity.deadline || '', record.notes || '']);
    });
    const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pathlight-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fa] text-gray-900">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-7 sm:px-8 lg:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#166534]">{activeView === 'applications' ? 'Your progress' : 'Explore opportunities'}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{activeView === 'applications' ? 'My Applications' : 'Find what comes next'}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{activeView === 'applications' ? 'Keep track of the opportunities you are pursuing and update their status as you go.' : 'Discover scholarships, fellowships, internships, and global programs matched to your goals.'}</p>
            </div>
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button onClick={() => aggregator.refresh()} disabled={aggregator.isLoading} className="flex items-center gap-2 rounded border bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-[#15803d] hover:text-[#166534] disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${aggregator.isLoading ? 'animate-spin' : ''}`} />{aggregator.isLoading ? 'Updating…' : 'Refresh sources'}</button>
                <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2 rounded border bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-[#15803d] hover:text-[#166534]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-[11px] font-semibold text-[#166534]">{profile.field.charAt(0)}</span>
              Update profile
                </button>
              </div>
          </div>

          {activeView === 'opportunities' && (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-md border border-green-100 bg-green-50/60 px-4 py-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#16a34a]" />
                <span>Showing opportunities ranked for <strong className="font-semibold text-gray-900">{profile.field}</strong> students.</span>
                </div>
                <span className="text-xs text-gray-500">{aggregator.sourceCount ? `${aggregator.sourceCount} live records` : 'Demo records active'}{aggregator.lastUpdated ? ` · Updated ${new Date(aggregator.lastUpdated).toLocaleString()}` : ''}{aggregator.sourceStatuses.length > 0 ? ` · ${aggregator.sourceStatuses.filter((source) => source.ok).length}/${aggregator.sourceStatuses.length} sources online` : ''}</span>
              </div>
              <div className="mb-6 md:hidden">
                <label className="flex items-center gap-2 rounded-md border bg-white px-3 py-2.5 text-sm text-gray-500"><Search className="h-4 w-4" /><input value={filters.searchQuery} onChange={(e) => updateFilter('searchQuery', e.target.value)} placeholder="Search opportunities" className="w-full outline-none" /></label>
              </div>
              <FilterBar />
            </>
          )}

          {activeView === 'opportunities' && sections.length > 0 && (
            <div className="mt-8 space-y-8">
              {sections.map((section) => (
                <section key={section.title}>
                  <div className="mb-3 flex items-center justify-between"><h2 className={`text-lg font-semibold ${section.accent}`}>{section.title}{section.title === 'Closing This Week' && <span className="ml-2 rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">Urgent</span>}</h2><span className="text-xs text-gray-500">{section.items.length} found</span></div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{section.items.slice(0, 3).map(({ opportunity, matchResult }) => <OpportunityCard key={`${section.title}-${opportunity.canonicalOpportunityId}`} opportunity={opportunity} matchResult={matchResult} />)}</div>
                </section>
              ))}
            </div>
          )}

          <div className="mb-4 mt-10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{activeView === 'applications' ? `${applicationOpportunities.length} tracked ${applicationOpportunities.length === 1 ? 'application' : 'applications'}` : `${filteredOpportunities.length} opportunities`}</h2>
              <p className="mt-1 text-xs text-gray-500">{activeView === 'applications' ? 'Statuses are saved automatically on this device.' : 'Official sources, clear deadlines, and transparent eligibility.'}</p>
            </div>
            {activeView === 'applications' ? <button onClick={exportApplicationsCsv} className="flex items-center gap-1.5 rounded border bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#15803d] hover:text-[#166534]"><Download className="h-3.5 w-3.5" />Export CSV</button> : <SlidersHorizontal className="h-4 w-4 text-gray-400" />}
          </div>

          {displayedOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {displayedOpportunities.map(({ opportunity, matchResult }) => <OpportunityCard key={opportunity.canonicalOpportunityId} opportunity={opportunity} matchResult={matchResult} applicationView={activeView === 'applications'} />)}
            </div>
          ) : (
            <div className="py-16 text-center">
              <h3 className="text-base font-semibold text-gray-900">{activeView === 'applications' ? 'No applications yet' : 'No opportunities match these filters'}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">{activeView === 'applications' ? 'Click Apply on an opportunity to start building your application list.' : 'Try adjusting your search or clearing one of your filters.'}</p>
            </div>
          )}
        </main>
        <footer className="border-t bg-white px-4 py-5 text-center text-xs text-gray-500 sm:px-8">
          Pathlight indexes official opportunity sources directly. Applications are completed on each host portal.
        </footer>
      </div>
      <OpportunityDetailModal />
      <ProfileModal />
      <SourceRegistryModal />
      <JsonImportModal />
    </div>
  );
};

export default function App() {
  return <AppProvider><MainView /></AppProvider>;
}