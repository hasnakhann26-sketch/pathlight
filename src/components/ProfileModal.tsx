import React, { useState } from 'react';
import { X, User, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EducationLevel, UserProfile } from '../types';

export const ProfileModal: React.FC = () => {
  const { profile, updateProfile, isProfileOpen, setIsProfileOpen } = useApp();

  const [formData, setFormData] = useState({
    name: profile.name ?? '',
    ageGroup: profile.ageGroup ?? '18-20',
    country: profile.country ?? '',
    citizenship: profile.citizenship ?? '',
    field: profile.field ?? 'Computer Science',
    educationLevel: profile.educationLevel ?? 'Undergraduate',
  });

  React.useEffect(() => {
    if (isProfileOpen) {
      setFormData({
        name: profile.name ?? '',
        ageGroup: profile.ageGroup ?? '18-20',
        country: profile.country ?? '',
        citizenship: profile.citizenship ?? '',
        field: profile.field ?? 'Computer Science',
        educationLevel: profile.educationLevel ?? 'Undergraduate',
      });
    }
  }, [isProfileOpen, profile]);

  if (!isProfileOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...profile,
      ...formData,
      age: profile.age || 20,
      degree: profile.degree || 'Bachelor',
      year: profile.year || 1,
    } as UserProfile);
    setIsProfileOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#166534]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Profile</h2>
              <p className="text-xs text-slate-500">Your information is used for matching.</p>
            </div>
          </div>

          <button type="button" onClick={() => setIsProfileOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close profile">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#166534]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Age group</label>
              <select
                value={formData.ageGroup ?? '18-20'}
                onChange={(e) => setFormData({ ...formData, ageGroup: (e.target.value as UserProfile['ageGroup']) ?? '18-20' })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#166534]"
              >
                <option value="15-17">15-17</option>
                <option value="18-20">18-20</option>
                <option value="21-25">21-25</option>
                <option value="26-30">26-30</option>
                <option value="30+">30+</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Current country</label>
              <input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#166534]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nationality</label>
            <input
              value={formData.citizenship}
              onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#166534]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Field of study</label>
              <input
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Education level</label>
              <select
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#166534]"
              >
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
                <option value="Postdoc">Postdoc</option>
                <option value="Early Career">Early Career</option>
                <option value="Any">Any</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#14532d]">
              <Save className="h-4 w-4" />
              Save profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

