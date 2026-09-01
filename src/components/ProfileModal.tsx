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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-200/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-slate-200/80 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f8faf8] p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-emerald-200 bg-emerald-100 p-2 text-emerald-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Pathlight Profile</h2>
              <p className="text-xs text-slate-500">
                Deterministic matching & eligibility updates dynamically as you modify your details.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileOpen(false)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4 text-xs sm:flex-row sm:items-center">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
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
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demographics & Nationality</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Age</label>
                <input
                  type="number"
                  min={15}
                  max={99}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Age Group</label>
                <select
                  value={formData.ageGroup || '18-20'}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as UserProfile['ageGroup'] })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="15-17">15 to 17</option>
                  <option value="18-20">18 to 20</option>
                  <option value="21-25">21 to 25</option>
                  <option value="26-30">26 to 30</option>
                  <option value="30+">30 and above</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Current Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Citizenship</label>
                <input
                  type="text"
                  value={formData.citizenship}
                  onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Grid 2: Academic Standing */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Education & Field of Study</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Education Level</label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate / Master</option>
                  <option value="PhD">PhD / Doctorate</option>
                  <option value="Early Career">Early Career</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Degree Title</label>
                <input
                  type="text"
                  placeholder="e.g. BS, BA, MS, PhD"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Field of Study</label>
                <select
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none cursor-pointer focus:border-emerald-500"
                >
                  {AVAILABLE_FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Academic Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value={1}>Year 1 (Freshman)</option>
                  <option value={2}>Year 2 (Sophomore)</option>
                  <option value={3}>Year 3 (Junior)</option>
                  <option value={4}>Year 4 (Senior)</option>
                  <option value={5}>Year 5+ / Graduate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid 3: Financial & Preferences */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Budget & Funding Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Personal Budget ($ USD)</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">$0 = Requires 100% full coverage</span>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Funding Requirement</label>
                <select
                  value={formData.fundingRequirement}
                  onChange={(e) => setFormData({ ...formData, fundingRequirement: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="fully_funded_only">Fully Funded Only (Stipend + Travel)</option>
                  <option value="paid_or_funded">Paid / Stipend or Funded</option>
                  <option value="any">Any Funding Structure</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Modality Preference</label>
                <select
                  value={formData.modalityPreference}
                  onChange={(e) => setFormData({ ...formData, modalityPreference: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="any">Any (Online, In-person, Hybrid)</option>
                  <option value="online">Online / Virtual Only</option>
                  <option value="in-person">In-Person Only</option>
                  <option value="hybrid">Hybrid Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Goals Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Target Goals (Powers Discovery Engine)</span>
            </h3>
            <p className="text-[11px] text-slate-600">
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
                        ? 'border border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Interests</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add interest & Enter"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs outline-none focus:border-emerald-500"
                />
                <button type="button" onClick={addInterest} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.interests.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                    <span>{item}</span>
                    <button type="button" onClick={() => removeInterest(item)} className="text-slate-500 hover:text-slate-700">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Skills</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add skill & Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs outline-none focus:border-emerald-500"
                />
                <button type="button" onClick={addSkill} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.skills.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                    <span>{item}</span>
                    <button type="button" onClick={() => removeSkill(item)} className="text-slate-500 hover:text-slate-700">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
            <label className="block text-slate-700 font-medium">Experience & Background Overview</label>
            <textarea
              rows={2}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs outline-none focus:border-emerald-500"
              placeholder="Brief description of your coursework, lab experience, or leadership..."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setFormData(DEMO_PROFILE);
                resetToDemoProfile();
              }}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Demo</span>
            </button>

            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
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

