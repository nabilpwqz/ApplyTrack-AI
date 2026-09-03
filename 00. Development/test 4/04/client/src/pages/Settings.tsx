import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { authAPI } from '../services/api.ts';
import { User as UserIcon, Mail, MapPin, Code, Bell, Shield, Save, Camera, Lock, AlertTriangle } from 'lucide-react';
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

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  // Deactivate account state
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState<boolean>(false);
  const [deactivating, setDeactivating] = useState<boolean>(false);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setAvatarPreview(base64String);
      setUploadingAvatar(true);

      const res = await authAPI.updateAvatar(base64String);
      setUploadingAvatar(false);

      if (res.success) {
        toast.success('Profile picture updated!');
      } else {
        toast.error('Failed to update profile picture');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    const res = await authAPI.changePassword(currentPassword, newPassword);
    setChangingPassword(false);

    if (res.success) {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.message || 'Failed to change password');
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    const res = await authAPI.deactivateAccount();
    setDeactivating(false);

    if (res.success) {
      toast.success('Account deactivated. Logging out...');
      localStorage.removeItem('applytrack_token');
      localStorage.removeItem('applytrack_user');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else {
      toast.error(res.message || 'Failed to deactivate account');
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account & Candidate Settings</h1>
        <p className="text-xs text-slate-400">Manage candidate profile info, skills list, and automation triggers</p>
      </div>

      {/* Profile Picture Section */}
      <div className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
        <h3 className="font-bold text-white text-base border-b border-white/5 pb-2 flex items-center gap-2">
          <Camera className="w-4 h-4 text-brand-400" />
          Profile Picture
        </h3>

        <div className="flex items-center gap-6">
          <div className="avatar">
            <div className="w-20 h-20 rounded-full ring ring-brand-500/30 ring-offset-2 ring-offset-neutral-900 overflow-hidden bg-neutral-800 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-slate-500" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="btn btn-sm btn-outline border-white/10 text-slate-200 hover:bg-white/5 rounded-xl text-xs cursor-pointer">
              {uploadingAvatar ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                'Upload New Photo'
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </label>
            <p className="text-[10px] text-slate-500">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-white/5 pb-2 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-brand-400" />
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
            <Bell className="w-4 h-4 text-brand-400" />
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
          className="btn btn-primary text-slate-950 font-bold px-8 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20"
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

      {/* Password Change Section */}
      <form onSubmit={handlePasswordChange} className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
        <h3 className="font-bold text-white text-base border-b border-white/5 pb-2 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-400" />
          Change Password
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="form-control md:col-span-2">
            <label className="label text-xs text-slate-400">Current Password</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs text-slate-400">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs text-slate-400">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="input input-sm input-bordered bg-neutral-900 border-white/10 text-white rounded-lg text-xs"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="btn btn-secondary text-white font-bold px-8 rounded-xl text-xs flex items-center gap-2"
          disabled={changingPassword}
        >
          {changingPassword ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <>
              <Lock className="w-4 h-4" /> Update Password
            </>
          )}
        </button>
      </form>

      {/* Danger Zone - Deactivate Account */}
      <div className="glass-card rounded-2xl p-6 border-red-500/20 space-y-4">
        <h3 className="font-bold text-red-400 text-base border-b border-red-500/10 pb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>

        <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10">
          <div>
            <h4 className="text-xs font-bold text-white">Deactivate Account</h4>
            <p className="text-[10px] text-slate-400 max-w-md">
              Your account will be deactivated and you'll be logged out. This action can be reversed by contacting support.
            </p>
          </div>

          {!showDeactivateConfirm ? (
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="btn btn-sm btn-outline border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl text-xs"
            >
              Deactivate
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="btn btn-sm btn-ghost text-slate-400 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="btn btn-sm bg-red-500 hover:bg-red-600 border-none text-white font-bold rounded-xl text-xs"
              >
                {deactivating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  'Confirm Deactivate'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Settings;