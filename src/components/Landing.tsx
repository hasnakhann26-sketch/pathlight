import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  const { setCurrentView, setIsProfileOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#050308] text-slate-200 font-sans selection:bg-violet-600 selection:text-white overflow-hidden">
      {/* Decorative Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="border-b border-violet-900/20 bg-[#050308]/90 backdrop-blur-md px-6 sm:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-700 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-violet-600/30">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Pathlight</span>
          </div>

          <div className="hidden sm:flex items-center gap-8 text-sm">
            <button className="text-slate-300 hover:text-white transition-colors">
              How it works
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Profile
            </button>
          </div>

          <button
            onClick={() => setCurrentView('explore')}
            className="hidden sm:inline-flex px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-600/30"
          >
            Explore
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 sm:px-8 py-16">
        <div className="max-w-3xl w-full space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                Find opportunities you didn't know existed.
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Pathlight helps you discover scholarships, fellowships, competitions, research programs, internships, hackathons, exchanges, and more — matched to what you're actually looking for.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => {
                  setIsProfileOpen(true);
                  setTimeout(() => setCurrentView('explore'), 300);
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-bold text-base transition-all shadow-xl shadow-violet-600/40 group"
              >
                <span className="flex items-center justify-center gap-2">
                  Build My Pathlight
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => setCurrentView('explore')}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-violet-500/30 transition-all"
              >
                Explore Opportunities
              </button>
            </div>
          </div>

          {/* Feature Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
            {[
              {
                icon: '🎓',
                title: 'Multi-Discipline',
                description: 'Opportunities across all fields and majors, not just your primary focus.',
              },
              {
                icon: '🎯',
                title: 'Goal-Matched',
                description: 'Find programs aligned with your specific goals and aspirations.',
              },
              {
                icon: '🌍',
                title: 'Global Scale',
                description: 'Access opportunities worldwide from verified, trusted sources.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-[#0f0a1d]/50 border border-violet-500/10 hover:border-violet-500/30 transition-all space-y-3"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-900/20 bg-[#050308] py-6 text-xs text-slate-400 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>Pathlight indexes and verifies official sources before surfacing matches. You apply directly on the host portal.</p>
        </div>
      </footer>
    </div>
  );
};
