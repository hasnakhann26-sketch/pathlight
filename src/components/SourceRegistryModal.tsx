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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-200/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white text-slate-800 overflow-hidden my-8 shadow-2xl shadow-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f8faf8] p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-emerald-200 bg-emerald-100 p-2 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Source Registry & Connector Architecture</h2>
                <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-700">
                  {sourceRegistry.length} Registered Sources
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ethical ingestion pipeline specifications, permissions, and synchronization health.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSourceRegistryOpen(false)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-start gap-3 border-b border-slate-200 bg-emerald-50 p-4 text-xs">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="leading-relaxed text-slate-600">
            <strong className="font-semibold text-slate-900">Our Ingestion Principle: </strong>
            Pathlight maintains explicit source provenance. We respect <code className="rounded bg-slate-100 px-1 py-0.5 text-emerald-700">robots.txt</code>, do not perform unauthorized scraping, route users directly to official hosts, and never claim fictitious automated crawlers.
          </div>
        </div>

        {/* Connector Pipeline Architecture Diagram / Flow */}
        <div className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Server className="h-3.5 w-3.5 text-emerald-600" />
            <span>Standard Connector Lifecycle</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-center text-[11px] sm:grid-cols-7">
            <div className="rounded-lg border border-slate-200 bg-white p-2">
              <span className="block font-bold text-emerald-700">1. Ingestion</span>
              <span className="text-[10px] text-slate-500">API / Open Data</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2">
              <span className="block font-bold text-emerald-700">2. Normalize</span>
              <span className="text-[10px] text-slate-500">Schema Map</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <span className="block font-bold text-emerald-700">3. Validate</span>
              <span className="text-[10px] text-slate-500">Constraint check</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <span className="block font-bold text-emerald-700">4. Deduplicate</span>
              <span className="text-[10px] text-slate-500">Canonical ID</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <span className="block font-bold text-emerald-700">5. Verify</span>
              <span className="text-[10px] text-slate-500">Deadlines/Links</span>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
              <span className="block font-bold text-emerald-700">6. Index</span>
              <span className="text-[10px] text-slate-500">Deterministic VM</span>
            </div>
            <div className="col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2 sm:col-span-1">
              <span className="block font-bold text-emerald-700">7. Discover</span>
              <span className="text-[10px] text-slate-500">User Matching</span>
            </div>
          </div>
        </div>

        {/* Source Entries List */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          {sourceRegistry.map((src) => (
            <div
              key={src.sourceId}
              className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs transition-all hover:border-emerald-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{src.sourceName}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      {src.permissionStatus}
                    </span>
                  </div>
                  <a
                    href={src.officialUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-0.5 flex items-center gap-1 text-[11px] text-emerald-700 underline hover:text-emerald-800"
                  >
                    <span>{src.officialUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-[11px]">
                    {src.connectorType}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{src.errorStatus}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl border border-slate-200 bg-white text-[11px]">
                <div>
                  <span className="text-slate-500 block">Categories:</span>
                  <span className="text-slate-700">{src.categoriesCovered.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sync Frequency:</span>
                  <span className="text-slate-700">{src.syncFrequency} (Last: {src.lastChecked})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ingested Records:</span>
                  <span className="font-mono font-bold text-emerald-700">{src.importCount} verified items</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed italic">"{src.usageNotes}"</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-[#f8faf8] p-4 text-xs text-slate-500 sm:p-5">
          <span>All indexed sources comply with fair open-access guidelines.</span>
          <button
            onClick={() => setIsSourceRegistryOpen(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};

