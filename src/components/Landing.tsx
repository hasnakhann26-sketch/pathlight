import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Landing: React.FC = () => {
  const { setCurrentView, setIsProfileOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2] text-slate-900 font-sans selection:bg-emerald-600 selection:text-white overflow-hidden">
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-200/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-lime-200/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <nav className="border-b border-slate-200 bg-white/85 backdrop-blur-md px-6 sm:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/20">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Pathlight</span>
          </div>

          <div className="hidden sm:flex items-center gap-8 text-sm text-slate-700">
            <button className="hover:text-emerald-700 transition-colors">How it works</button>
            <button onClick={() => setIsProfileOpen(true)} className="hover:text-emerald-700 transition-colors">Profile</button>
            <button onClick={() => setCurrentView('applications')} className="hover:text-emerald-700 transition-colors">Applications</button>
          </div>

          <button onClick={() => setCurrentView('explore')} className="hidden sm:inline-flex px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20">
            Explore
          </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 sm:px-8 py-16">
        <div className="max-w-3xl w-full space-y-12">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Built for student builders
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
                Find opportunities you did not know existed.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Pathlight helps you discover scholarships, fellowships, competitions, research programs, internships, hackathons, exchanges, and more — matched to your goals and timeline.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => {
                  setIsProfileOpen(true);
                  setTimeout(() => setCurrentView('explore'), 300);
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-base transition-all shadow-xl shadow-emerald-600/20 group"
              >
                <span className="flex items-center justify-center gap-2">
                  Build My Pathlight
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => setCurrentView('explore')}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white hover:bg-slate-50 text-slate-900 font-bold text-base border border-slate-200 transition-all"
              >
                Explore Opportunities
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
            {[
              {
                icon: '🎓',
                title: 'Multi-Discipline',
                description: 'Programs across fields and majors, not just your primary focus.',
              },
              {
                icon: '🎯',
                title: 'Goal-Matched',
                description: 'Find options aligned to your career objectives and profile.',
              },
              {
                icon: '🌍',
                title: 'Global Scale',
                description: 'Access funded opportunities from trusted, verifiable sources.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-200 transition-all space-y-3">
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-6 text-xs text-slate-600 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>Pathlight indexes and verifies official sources before surfacing matches. You apply directly on the host portal.</p>
        </div>
      </footer>
    </div>
  );
};
