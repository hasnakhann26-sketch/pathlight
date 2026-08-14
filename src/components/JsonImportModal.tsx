import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  UploadCloud,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';

export const JsonImportModal: React.FC = () => {
  const {
    isJsonImportOpen,
    setIsJsonImportOpen,
    importJsonOpportunities,
    exportJsonDataset,
    resetDatasetToDefault,
    opportunities,
  } = useApp();

  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isJsonImportOpen) return null;

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) {
      setImportStatus({ success: false, message: 'Please paste valid JSON before submitting.' });
      return;
    }

    const res = importJsonOpportunities(jsonInput);
    if (res.success) {
      setImportStatus({
        success: true,
        message: `Successfully imported & deduplicated ${res.count} opportunity record(s)!`,
      });
      setJsonInput('');
    } else {
      setImportStatus({
        success: false,
        message: `Import failed: ${res.error}`,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  const handleCopyExport = () => {
    const data = exportJsonDataset();
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const data = exportJsonDataset();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathlight_dataset_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#0a0514] border border-violet-500/20 shadow-2xl shadow-violet-950/50 text-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-violet-900/30 bg-[#050308]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Dataset Ingestion & JSON Import</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-800/60 font-semibold">
                  {opportunities.length} Active Records
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Extend Pathlight with verified JSON opportunity feeds without recompilation.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsJsonImportOpen(false)}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Status Message */}
          {importStatus && (
            <div
              className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
                importStatus.success
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                  : 'bg-red-950/60 text-red-300 border border-red-700/60'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-violet-400" />
                <span>Paste Normalized Opportunity JSON or Upload File</span>
              </label>

              <label className="cursor-pointer px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-white/10 transition-colors">
                <span>Upload .JSON File</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "canonicalOpportunityId": "opp_custom_example_1",\n    "title": "Example Fellowship",\n    "organization": "Global Foundation",\n    "category": "Fellowships",\n    "modality": "online",\n    "funding": "fully_funded",\n    "officialSourceUrl": "https://example.org",\n    "applicationUrl": "https://example.org/apply"\n  }\n]`}
              className="w-full p-3.5 rounded-2xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 font-mono text-xs text-white outline-none leading-relaxed"
            />

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Validate, Deduplicate & Ingest Records</span>
            </button>
          </form>

          {/* Export & Reset Controls */}
          <div className="pt-4 border-t border-violet-900/20 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Dataset Management
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleCopyExport}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-xs font-medium text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Full JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-xs font-medium text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-violet-400" />
                <span>Download .JSON File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetDatasetToDefault();
                  setImportStatus({ success: true, message: 'Dataset reset to verified default benchmark.' });
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-800/50 text-xs font-medium text-red-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>Reset to Default Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-violet-900/30 bg-[#050308]/90 flex items-center justify-between text-xs text-slate-400">
          <span>Schema adheres to Pathlight canonical normalized opportunity standard.</span>
          <button
            onClick={() => setIsJsonImportOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold border border-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

