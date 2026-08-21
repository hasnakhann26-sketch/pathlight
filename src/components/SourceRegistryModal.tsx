import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Database,
  ExternalLink,
  ShieldCheck,
  Activity,
  Server,
} from 'lucide-react';

export const SourceRegistryModal: React.FC = () => {
  const { sourceRegistry, isSourceRegistryOpen, setIsSourceRegistryOpen } = useApp();

  if (!isSourceRegistryOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-[#0a0514] border border-violet-500/20 shadow-2xl shadow-violet-950/50 text-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-violet-900/30 bg-[#050308]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Source Registry & Connector Architecture</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-800/60 font-semibold">
                  {sourceRegistry.length} Registered Sources
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ethical ingestion pipeline specifications, permissions, and synchronization health.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSourceRegistryOpen(false)}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ethical Transparency Banner */}
        <div className="p-4 bg-violet-950/30 border-b border-violet-900/30 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 leading-relaxed">
            <strong className="text-white font-semibold">Our Ingestion Principle: </strong>
            Pathlight maintains explicit source provenance. We respect <code className="text-violet-300 bg-[#050308] px-1 py-0.5 rounded">robots.txt</code>, do not perform unauthorized scraping, route users directly to official hosts, and never claim fictitious automated crawlers.
          </div>
        </div>

        {/* Connector Pipeline Architecture Diagram / Flow */}
        <div className="p-5 sm:p-6 border-b border-violet-900/20 bg-[#0f0a1d]/60">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-violet-400" />
            <span>Standard Connector Lifecycle</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5 text-center text-[11px]">
            <div className="p-2 rounded-lg bg-[#0a0514] border border-violet-500/10">
              <span className="text-violet-400 font-bold block">1. Ingestion</span>
              <span className="text-slate-500 text-[10px]">API / Open Data</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0514] border border-violet-500/10">
              <span className="text-violet-400 font-bold block">2. Normalize</span>
              <span className="text-slate-500 text-[10px]">Schema Map</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0514] border border-violet-500/10">
              <span className="text-violet-400 font-bold block">3. Validate</span>
              <span className="text-slate-500 text-[10px]">Constraint check</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0514] border border-violet-500/10">
              <span className="text-violet-400 font-bold block">4. Deduplicate</span>
              <span className="text-slate-500 text-[10px]">Canonical ID</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0514] border border-violet-500/10">
              <span className="text-violet-400 font-bold block">5. Verify</span>
              <span className="text-slate-500 text-[10px]">Deadlines/Links</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0514] border border-violet-500/10">
              <span className="text-emerald-400 font-bold block">6. Index</span>
              <span className="text-slate-500 text-[10px]">Deterministic VM</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0514] border border-violet-500/10 col-span-2 sm:col-span-1">
              <span className="text-emerald-400 font-bold block">7. Discover</span>
              <span className="text-slate-500 text-[10px]">User Matching</span>
            </div>
          </div>
        </div>

        {/* Source Entries List */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          {sourceRegistry.map((src) => (
            <div
              key={src.sourceId}
              className="p-4 rounded-2xl bg-[#0f0a1d] border border-violet-500/10 hover:border-violet-500/30 transition-all text-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{src.sourceName}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold">
                      {src.permissionStatus}
                    </span>
                  </div>
                  <a
                    href={src.officialUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[11px] text-violet-400 hover:text-violet-300 underline flex items-center gap-1 mt-0.5"
                  >
                    <span>{src.officialUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2 py-1 rounded-md bg-slate-900 border border-white/5 text-slate-300 font-mono text-[11px]">
                    {src.connectorType}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{src.errorStatus}</span>
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-[#0a0514] border border-white/5 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Categories:</span>
                  <span className="text-slate-200">{src.categoriesCovered.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sync Frequency:</span>
                  <span className="text-slate-200">
                    {src.syncFrequency} (Last: {src.lastChecked})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ingested Records:</span>
                  <span className="text-violet-300 font-bold font-mono">
                    {src.importCount} verified items
                  </span>
                </div>
              </div>

              {/* Usage Notes */}
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                "{src.usageNotes}"
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-violet-900/30 bg-[#050308]/90 flex items-center justify-between text-xs text-slate-400">
          <span>All indexed sources comply with fair open-access guidelines.</span>
          <button
            onClick={() => setIsSourceRegistryOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold border border-white/5 transition-colors"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};

