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
  const { stats, profile, setIsProfileOpen, filters, updateFilter } = useApp();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 p-3.5 rounded-xl bg-[#0a0514] border border-violet-900/30 text-xs">
      {/* Active Profile Summary Tag */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-950/40 border border-violet-500/20 text-violet-300">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Active Profile:</span>
          <strong className="font-semibold text-white">
            {profile.field} ({profile.degree || profile.educationLevel}, Yr {profile.year})
          </strong>
        </div>

        <span className="text-slate-600 hidden sm:inline">•</span>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span>{profile.country}</span>
          <span>(Budget: ${profile.budget})</span>
        </div>

        <button
          onClick={() => setIsProfileOpen(true)}
          className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 underline font-medium ml-1 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Quick Real-Time Metrics */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 md:pb-0">
        {/* Total */}
        <div className="flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
          <span className="font-semibold text-white">{stats.total}</span>
          <span>Total</span>
        </div>

        <span className="text-slate-700">|</span>

        {/* Eligible Quick Filter */}
        <button
          onClick={() => updateFilter('eligibleOnly', !filters.eligibleOnly)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all whitespace-nowrap ${
            filters.eligibleOnly
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 font-semibold'
              : 'text-slate-400 hover:text-emerald-400'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong className="text-white">{stats.eligibleCount}</strong> Eligible
          </span>
        </button>

        <span className="text-slate-700">|</span>

        {/* Fully Funded */}
        <div className="flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
          <DollarSign className="w-3.5 h-3.5 text-violet-400" />
          <span>
            <strong className="text-slate-200">{stats.fullyFundedCount}</strong> Fully Funded
          </span>
        </div>

        <span className="text-slate-700">|</span>

        {/* Closing Soon */}
        <button
          onClick={() =>
            updateFilter('deadlineFilter', filters.deadlineFilter === 'closing_soon' ? 'all' : 'closing_soon')
          }
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all whitespace-nowrap ${
            filters.deadlineFilter === 'closing_soon'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-600/60 font-semibold'
              : 'text-slate-400 hover:text-amber-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>
            <strong className="text-slate-200">{stats.closingSoonCount}</strong> Closing Soon
          </span>
        </button>
      </div>
    </div>
  );
};

