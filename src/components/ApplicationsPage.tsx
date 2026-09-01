import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, FileText, Plus, ExternalLink, CalendarDays } from 'lucide-react';

const STATUS_OPTIONS = ['Applied', 'In Review', 'Results Pending', 'Accepted', 'Rejected'] as const;

export const ApplicationsPage: React.FC = () => {
  const { applications, updateApplication, exportApplicationsCsv, setCurrentView } = useApp();

  const handleDownloadCsv = () => {
    const csv = exportApplicationsCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pathlight_applications.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (applications.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">Applications</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">My Applications</h2>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('explore')}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
          >
            <Plus className="h-4 w-4" />
            Explore opportunities
          </button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No applications yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            When you click Apply on an opportunity, it will appear here with status tracking and notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-800">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">Applications</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">My Applications</h2>
        </div>
        <button
          type="button"
          onClick={handleDownloadCsv}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-green-200 hover:text-green-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">{app.category}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">{app.organization}</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{app.opportunityTitle}</h3>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-green-700" />
                    Applied: {app.dateApplied}
                  </span>
                  <a
                    href={app.applicationUrl || app.officialUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-green-700 hover:text-green-800"
                  >
                    Official link
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-3">
                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Status</label>
                <select
                  value={app.status}
                  onChange={(e) => updateApplication(app.id, { status: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-0 transition focus:border-green-600"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Notes</label>
                <textarea
                  value={app.notes}
                  onChange={(e) => updateApplication(app.id, { notes: e.target.value })}
                  rows={3}
                  placeholder="Add a note about your application, deadlines, follow-ups, or reminders..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Results history</label>
                <div className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {app.history.length === 0 ? (
                    <span className="text-slate-500">No history yet.</span>
                  ) : (
                    app.history.slice().reverse().map((entry, index) => (
                      <div key={`${app.id}-${entry.timestamp}-${index}`} className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
                        <span>{entry.status}</span>
                        <span className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
