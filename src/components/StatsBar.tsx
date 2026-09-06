import React from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Clock3 } from 'lucide-react';
import { CONNECTORS } from '../engine/RSSAggregator';

export const StatsBar: React.FC = () => {
  const { opportunities, rssStatus } = useApp();
  const healthyFeedCount = rssStatus.sourceStatus.filter((source) => source.ok).length;
  const completedFeedCount = rssStatus.sourceStatus.length;
  const totalSources = CONNECTORS.length;
  const updatedText = rssStatus.lastUpdated ? `Updated ${Math.max(1, Math.round((Date.now() - new Date(rssStatus.lastUpdated).getTime()) / 60000))} min ago` : 'Updated just now';

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium sm:text-sm ${healthyFeedCount < totalSources ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
    >
      <div className="inline-flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5" />
        <span>{rssStatus.isLoading ? `${completedFeedCount}/${totalSources} sources loaded` : `${healthyFeedCount}/${totalSources} sources · ${opportunities.length.toLocaleString()} opportunities`}</span>
      </div>

      <span className="text-slate-400">·</span>

      <span>{opportunities.length.toLocaleString()} opportunities</span>

      <span className="text-slate-400">·</span>

      <div className="inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5" />
        <span>{updatedText}</span>
      </div>
    </div>
  );
};

