import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  DollarSign,
  Clock,
  Sparkles,
  Edit3,
} from 'lucide-react';

export const StatsBar: React.FC = () => {
  const { stats, profile, setIsProfileOpen, filters, updateFilter, rssStatus } = useApp();
  const healthyFeedCount = rssStatus.sourceStatus.filter((source) => source.ok).length;
  const lastUpdatedLabel = rssStatus.lastUpdated ? new Date(rssStatus.lastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'waiting';

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-3.5 text-xs shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Active Profile:</span>
          <strong className="font-semibold text-slate-900">
            {profile.field} ({profile.degree || profile.educationLevel}, Yr {profile.year})
          </strong>
        </div>

        <span className="hidden text-gray-500 sm:inline">•</span>

        <div className="flex items-center gap-1.5 text-gray-600">
          <span>{profile.country}</span>
          <span>(Budget: ${profile.budget})</span>
        </div>

        <button
          onClick={() => setIsProfileOpen(true)}
          className="ml-1 inline-flex items-center gap-1 font-medium text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline"
        >
          <Edit3 className="h-3 w-3" />
          <span>Edit Profile</span>
        </button>

        <span className="hidden text-gray-500 sm:inline">•</span>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>{rssStatus.isLoading ? 'Refreshing feeds...' : `Live feeds: ${healthyFeedCount}/${rssStatus.sourceStatus.length || 0}`}</span>
          <span className="text-[10px] text-gray-500">{lastUpdatedLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 sm:gap-4">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-slate-600">
          <span className="font-semibold text-slate-900">{stats.total}</span>
          <span>Total</span>
        </div>

        <span className="text-gray-400">|</span>

        <button
          onClick={() => updateFilter('eligibleOnly', !filters.eligibleOnly)}
          className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 whitespace-nowrap transition-all ${
            filters.eligibleOnly
              ? 'border border-emerald-200 bg-emerald-50 font-semibold text-emerald-700'
              : 'text-gray-600 hover:text-emerald-700'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            <strong className="text-slate-900">{stats.eligibleCount}</strong> Eligible
          </span>
        </button>

        <span className="text-gray-400">|</span>

        <div className="flex items-center gap-1.5 whitespace-nowrap text-gray-600">
          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            <strong className="text-slate-900">{stats.fullyFundedCount}</strong> Fully Funded
          </span>
        </div>

        <span className="text-gray-400">|</span>

        <button
          onClick={() =>
            updateFilter('deadlineFilter', filters.deadlineFilter === 'closing_soon' ? 'all' : 'closing_soon')
          }
          className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 whitespace-nowrap transition-all ${
            filters.deadlineFilter === 'closing_soon'
              ? 'border border-amber-200 bg-amber-50 font-semibold text-amber-700'
              : 'text-slate-600 hover:text-amber-700'
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          <span>
            <strong className="text-slate-900">{stats.closingSoonCount}</strong> Closing Soon
          </span>
        </button>
      </div>
    </div>
  );
};

