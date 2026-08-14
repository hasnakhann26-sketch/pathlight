import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  RotateCcw,
  Sparkles,
  Save,
  Check,
  Plus,
  GraduationCap,
  Target,
  DollarSign,
  Globe,
} from 'lucide-react';
import {
  DEMO_PROFILE,
  ALTERNATIVE_DEMO_PROFILES,
  AVAILABLE_FIELDS,
  AVAILABLE_GOALS,
} from '../data/defaultProfile';
import { EducationLevel, UserProfile } from '../types';

export const ProfileModal: React.FC = () => {
  const { profile, updateProfile, resetToDemoProfile, isProfileOpen, setIsProfileOpen } = useApp();

  // Local draft state
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [interestInput, setInterestInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync draft when opened
  React.useEffect(() => {
    if (isProfileOpen) {
      setFormData(profile);
      setSavedSuccess(false);
    }
  }, [isProfileOpen, profile]);

  if (!isProfileOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileOpen(false);
    }, 600);
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, interestInput.trim()] });
      setInterestInput('');
    }
  };

  const removeInterest = (item: string) => {
    setFormData({ ...formData, interests: formData.interests.filter((i) => i !== item) });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (item: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== item) });
  };

  const toggleGoal = (goal: string) => {
    if (formData.goals.includes(goal)) {
      setFormData({ ...formData, goals: formData.goals.filter((g) => g !== goal) });
    } else {
      setFormData({ ...formData, goals: [...formData.goals, goal] });
    }
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
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Your Pathlight Profile</h2>
              <p className="text-xs text-slate-400">
                Deterministic matching & eligibility updates dynamically as you modify your details.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileOpen(false)}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Profiles Quick Switcher */}
        <div className="p-4 bg-[#0f0a1d]/60 border-b border-violet-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-violet-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Preset Benchmark Profile:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {ALTERNATIVE_DEMO_PROFILES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFormData(preset.profile);
                  updateProfile(preset.profile);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-violet-600/30 text-slate-300 hover:text-violet-200 border border-white/5 hover:border-violet-500/30 transition-all font-medium"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Grid 1: Basic Identity & Demographics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              <span>Demographics & Nationality</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Age</label>
                <input
                  type="number"
                  min={15}
                  max={99}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Current Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Citizenship</label>
                <input
                  type="text"
                  value={formData.citizenship}
                  onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Grid 2: Academic Standing */}
          <div className="space-y-3 pt-2 border-t border-violet-900/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
              <span>Education & Field of Study</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Education Level</label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none cursor-pointer"
                >
                  <option value="High School" className="bg-[#0a0514]">High School</option>
                  <option value="Undergraduate" className="bg-[#0a0514]">Undergraduate</option>
                  <option value="Graduate" className="bg-[#0a0514]">Graduate / Master</option>
                  <option value="PhD" className="bg-[#0a0514]">PhD / Doctorate</option>
                  <option value="Early Career" className="bg-[#0a0514]">Early Career</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Degree Title</label>
                <input
                  type="text"
                  placeholder="e.g. BS, BA, MS, PhD"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Field of Study</label>
                <select
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none cursor-pointer"
                >
                  {AVAILABLE_FIELDS.map((f) => (
                    <option key={f} value={f} className="bg-[#0a0514]">
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Academic Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none cursor-pointer"
                >
                  <option value={1} className="bg-[#0a0514]">Year 1 (Freshman)</option>
                  <option value={2} className="bg-[#0a0514]">Year 2 (Sophomore)</option>
                  <option value={3} className="bg-[#0a0514]">Year 3 (Junior)</option>
                  <option value={4} className="bg-[#0a0514]">Year 4 (Senior)</option>
                  <option value={5} className="bg-[#0a0514]">Year 5+ / Graduate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid 3: Financial & Preferences */}
          <div className="space-y-3 pt-2 border-t border-violet-900/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-violet-400" />
              <span>Budget & Funding Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Personal Budget ($ USD)</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none"
                />
                <span className="text-[10px] text-slate-500">$0 = Requires 100% full coverage</span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Funding Requirement</label>
                <select
                  value={formData.fundingRequirement}
                  onChange={(e) => setFormData({ ...formData, fundingRequirement: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none cursor-pointer"
                >
                  <option value="fully_funded_only" className="bg-[#0a0514]">Fully Funded Only (Stipend + Travel)</option>
                  <option value="paid_or_funded" className="bg-[#0a0514]">Paid / Stipend or Funded</option>
                  <option value="any" className="bg-[#0a0514]">Any Funding Structure</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Modality Preference</label>
                <select
                  value={formData.modalityPreference}
                  onChange={(e) => setFormData({ ...formData, modalityPreference: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white outline-none cursor-pointer"
                >
                  <option value="any" className="bg-[#0a0514]">Any (Online, In-person, Hybrid)</option>
                  <option value="online" className="bg-[#0a0514]">Online / Virtual Only</option>
                  <option value="in-person" className="bg-[#0a0514]">In-Person Only</option>
                  <option value="hybrid" className="bg-[#0a0514]">Hybrid Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Goals Selection */}
          <div className="space-y-2 pt-2 border-t border-violet-900/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-violet-400" />
              <span>Target Goals (Powers Discovery Engine)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Select key milestones you want to achieve. Pathlight maps these to cross-category opportunities.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {AVAILABLE_GOALS.map((goal) => {
                const active = formData.goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 border border-violet-500'
                        : 'bg-[#0f0a1d] text-slate-400 hover:text-slate-200 border border-white/5'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Interests & Skills Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-violet-900/20 text-xs">
            {/* Interests */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Interests</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add interest & Enter"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#0f0a1d] border border-white/10 text-white text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.interests.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeInterest(item)}
                      className="text-slate-500 hover:text-slate-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Skills</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add skill & Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#0f0a1d] border border-white/10 text-white text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.skills.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(item)}
                      className="text-slate-500 hover:text-slate-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Experience Summary */}
          <div className="space-y-1.5 pt-2 border-t border-violet-900/20 text-xs">
            <label className="block text-slate-300 font-medium">Experience & Background Overview</label>
            <textarea
              rows={2}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#0f0a1d] border border-white/10 focus:border-violet-500 text-white text-xs outline-none"
              placeholder="Brief description of your coursework, lab experience, or leadership..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-violet-900/20">
            <button
              type="button"
              onClick={() => {
                setFormData(DEMO_PROFILE);
                resetToDemoProfile();
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Demo</span>
            </button>

            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profile Saved & Recalculated!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile & Recalculate Matches</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

