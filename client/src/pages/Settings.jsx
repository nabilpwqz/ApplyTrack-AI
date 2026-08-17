import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, MapPin, DollarSign, Sparkles, Bell, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('JUNIOR');
  const [skills, setSkills] = useState('');
  const [preferredRoles, setPreferredRoles] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.profile?.headline || '');
      setLocation(user.profile?.location || '');
      setExperienceLevel(user.profile?.experienceLevel || 'JUNIOR');
      setSkills(user.profile?.skills?.join(', ') || '');
      setPreferredRoles(user.profile?.preferredRoles?.join(', ') || '');
      setSalaryMin(user.profile?.preferredSalary?.min || '');
      setSalaryMax(user.profile?.preferredSalary?.max || '');
      setEmailNotifications(user.preferences?.emailNotifications ?? true);
      setReminderNotifications(user.preferences?.reminderNotifications ?? true);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const profilePayload = {
      name,
      profile: {
        headline,
        location,
        experienceLevel,
        skills: skills ? skills.split(',').map(s => s.trim()) : [],
        preferredRoles: preferredRoles ? preferredRoles.split(',').map(r => r.trim()) : [],
        preferredSalary: {
          min: Number(salaryMin) || 0,
          max: Number(salaryMax) || 0,
          currency: 'USD',
        },
      },
      preferences: {
        emailNotifications,
        reminderNotifications,
      },
    };

    const res = await updateProfile(profilePayload);
    setSaving(false);

    if (res.success) {
      toast.success('Profile and preferences updated successfully!');
    } else {
      toast.error('Failed to update profile: ' + res.message);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account & Profile Settings</h1>
        <p className="text-xs text-slate-400">Configure your candidate credentials to improve AI matching accuracy</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic info card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-white/5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-white text-base">Candidate Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1 text-slate-400 text-xs font-bold uppercase">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                required
              />
            </div>

            <div className="form-control">
              <label className="label py-1 text-slate-400 text-xs font-bold uppercase">Headline / Preferred Title</label>
              <input
                type="text"
                placeholder="Frontend Software Engineer"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
              />
            </div>

            <div className="form-control">
              <label className="label py-1 text-slate-400 text-xs font-bold uppercase">Current Location</label>
              <input
                type="text"
                placeholder="Austin, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
              />
            </div>

            <div className="form-control">
              <label className="label py-1 text-slate-400 text-xs font-bold uppercase">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="select select-sm select-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
              >
                <option value="ENTRY_LEVEL">Entry Level (0-1 yrs)</option>
                <option value="JUNIOR">Junior Developer (1-3 yrs)</option>
                <option value="MID_LEVEL">Mid Level (3-5 yrs)</option>
                <option value="SENIOR">Senior Developer (5-8 yrs)</option>
                <option value="LEAD">Lead / Manager (8+ yrs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills & Preferences card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-white/5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="w-5 h-5 text-secondary" />
            <h2 className="font-bold text-white text-base">Skills & AI Evaluation Parameters</h2>
          </div>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label py-1 text-slate-400 text-xs font-bold uppercase">Technical Skills (Comma-separated)</label>
              <input
                type="text"
                placeholder="React, JavaScript, TypeScript, Node.js, Express, MongoDB, Tailwind CSS"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
              />
              <p className="text-[10px] text-slate-500 pt-1">Used by Gemini AI models to calculate interview probability and missing skill warnings.</p>
            </div>

            <div className="form-control">
              <label className="label py-1 text-slate-400 text-xs font-bold uppercase">Target Roles (Comma-separated)</label>
              <input
                type="text"
                placeholder="Frontend Developer, Full Stack Engineer, React Developer"
                value={preferredRoles}
                onChange={(e) => setPreferredRoles(e.target.value)}
                className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs font-bold uppercase">Min Salary Target ($)</label>
                <input
                  type="number"
                  placeholder="85000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-slate-400 text-xs font-bold uppercase">Max Salary Target ($)</label>
                <input
                  type="number"
                  placeholder="120000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="input input-sm input-bordered bg-neutral-900 border-white/5 text-white rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-white/5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Bell className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-white text-base">Notifications & Inactivity Alerts</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="checkbox checkbox-primary checkbox-sm rounded"
              />
              <div>
                <p className="text-xs font-bold text-white">Recruiter Email Sync Notifications</p>
                <p className="text-[10px] text-slate-400">Receive inbox alerts when new recruiter emails are detected</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reminderNotifications}
                onChange={(e) => setReminderNotifications(e.target.checked)}
                className="checkbox checkbox-primary checkbox-sm rounded"
              />
              <div>
                <p className="text-xs font-bold text-white">Inactivity Follow-Up Reminders</p>
                <p className="text-[10px] text-slate-400">Auto-create follow-up tasks when applications have no activity for 10+ days</p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20"
          disabled={saving}
        >
          {saving ? <span className="loading loading-spinner loading-xs"></span> : <Save className="w-4 h-4" />}
          Save Profile Settings
        </button>

      </form>
    </div>
  );
};
export default Settings;
