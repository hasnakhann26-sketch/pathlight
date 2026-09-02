import React, { useMemo } from 'react';
import { RefreshCw, Globe, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FEED_DEFINITIONS = [
  { name: 'Opportunity Desk', url: 'https://opportunitydesk.org/feed/', tier: 1 },
  { name: 'Youth Op', url: 'https://www.youthop.com/feed', tier: 1 },
  { name: 'OYA Opportunities', url: 'https://oyaop.com/feed/', tier: 1 },
  { name: 'Opportunities For Youth', url: 'https://opportunitiesforyouth.org/feed/', tier: 1 },
  { name: 'Opportunities Radar', url: 'https://opportunitiesradar.com/feed/', tier: 1 },
  { name: 'Funds For NGOs', url: 'https://www2.fundsforngos.org/feed/', tier: 2 },
  { name: 'Global Grants Hub', url: 'https://globalgrantshub.org/feed/', tier: 2 },
  { name: 'Student Competitions', url: 'https://studentcompetitions.com/rss', tier: 2 },
  { name: 'Opportunities Corners', url: 'https://opportunitiescorners.com/feed/', tier: 2 },
  { name: 'Best Delegate', url: 'https://bestdelegate.com/feed/', tier: 2 },
  { name: 'My MUN', url: 'https://mymun.com/', tier: 3 },
  { name: 'Best Delegate MUN', url: 'https://bestdelegate.com/model-un-conferences/', tier: 3 },
] as const;

export const SourcesPage: React.FC = () => {
  const { rssStatus, refreshRSSStatus } = useApp();

  const statusByName = useMemo(() => {
    return Object.fromEntries(rssStatus.sourceStatus.map((source) => [source.name, source]));
  }, [rssStatus.sourceStatus]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#166534]">Feed health</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sources</h1>
        </div>
        <button
          type="button"
          onClick={() => void refreshRSSStatus()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${rssStatus.isLoading ? 'animate-spin' : ''}`} />
          Refresh all
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Total sources</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">12</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Live</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{rssStatus.sourceStatus.filter((source) => source.ok).length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Failed</div>
          <div className="mt-2 text-2xl font-bold text-red-600">{rssStatus.sourceStatus.filter((source) => !source.ok).length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Last update</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {rssStatus.lastUpdated ? new Date(rssStatus.lastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Waiting'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {FEED_DEFINITIONS.map((feed) => {
          const source = statusByName[feed.name];
          const status = source ? (source.ok ? 'Live' : 'Failed') : 'Loading';
          const badgeClasses = source
            ? source.ok
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-red-50 text-red-700 ring-red-200'
            : 'bg-amber-50 text-amber-700 ring-amber-200';

          return (
            <div key={feed.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{feed.name}</h2>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 ${badgeClasses}`}>
                      {status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Globe className="h-4 w-4" />
                    <a href={feed.url} target="_blank" rel="noreferrer" className="truncate text-slate-600 underline-offset-2 hover:underline">
                      {feed.url}
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">Tier {feed.tier}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">
                    {source?.itemCount ?? 0} opportunities
                  </span>
                  <button
                    type="button"
                    onClick={() => void refreshRSSStatus()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {source && !source.ok ? <AlertTriangle className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    Retry
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>Last checked: {source?.lastChecked ? new Date(source.lastChecked).toLocaleString() : 'Pending'}</span>
                <span>{source ? (source.ok ? 'Feed responded successfully' : 'Feed failed to return valid data') : 'Waiting for first fetch'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
