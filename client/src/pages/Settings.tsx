import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { authAPI } from '../services/api.ts';
import { User as UserIcon, Mail, MapPin, Code, Bell, Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  const [name, setName] = useState<string>(user?.name || 'Guest');
  const [headline, setHeadline] = useState<string>(user?.profile?.headline || 'Software Engineer');
  const [location, setLocation] = useState<string>(user?.profile?.location || 'Austin, TX');
  const [skillsText, setSkillsText] = useState<string>(user?.profile?.skills ? user.profile.skills.join(', ') : 'React, TypeScript, Node.js, Express, MongoDB');
  
  const [inactivityAlerts, setInactivityAlerts] = useState<boolean>(true);
  const [autoEmailSync, setAutoEmailSync] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

    const res = await authAPI.updateProfile({
      name,
      profile: {
        headline,
        location,
        skills,
      },
      preferences: {
        inactivityAlerts,
        autoEmailSync,
      }
    });

    setSaving(false);

    if (res.success) {
      toast.success('Settings and profile parameters saved!');
    } else {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account & Candidate Settings</h1>
        <p className="text-xs text-slate-400">Manage candidate profile info, skills list, and automation triggers</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-white/5 pb-2 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-amber-400" />
            Profile Credentials
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label text-xs text-slate-400">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs text-slate-400">Email Address (Read-only)</label>
              <input 
                type="email" 
                value={user?.email || 'guest@applytrack.ai'}
                disabled
                className="input input-sm input-bordered bg-neutral-900/50 border-white/5 text-slate-500 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label text-xs text-slate-400">Professional Headline</label>
              <input 
                type="text" 
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
              />
            </div>

            <div className="form-control">
              <label className="label text-xs text-slate-400">Current Location</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs text-slate-400">Skills List (Comma separated for AI Job Matcher)</label>
            <input 
              type="text" 
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-white/5 pb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Automation & Scanners
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral/40 rounded-xl border border-white/5">
              <div>
                <h4 className="text-xs font-bold text-white">Inactivity Reminder Scanner</h4>
                <p className="text-[10px] text-slate-400">Auto-create follow-up tasks if no contact for 10+ days</p>
              </div>
              <input 
                type="checkbox" 
                className="toggle toggle-primary toggle-sm"
                checked={inactivityAlerts}
                onChange={(e) => setInactivityAlerts(e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral/40 rounded-xl border border-white/5">
              <div>
                <h4 className="text-xs font-bold text-white">Background Email Sync</h4>
                <p className="text-[10px] text-slate-400">Check recruiter emails automatically every 45 seconds</p>
              </div>
              <input 
                type="checkbox" 
                className="toggle toggle-primary toggle-sm"
                checked={autoEmailSync}
                onChange={(e) => setAutoEmailSync(e.target.checked)}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="btn btn-primary text-slate-950 font-bold px-8 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
          disabled={saving}
        >
          {saving ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Profile Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
};
export default Settings;
