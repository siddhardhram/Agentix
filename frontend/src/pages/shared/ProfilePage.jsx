import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { updateProfile, uploadAvatar } from '../../services/supabase';
import { Camera, Save, User, Mail, Shield, Clock, AlertCircle, CheckCircle2, Sun, Moon, Laptop, Palette } from 'lucide-react';

export default function ProfilePage() {
  const { profile, role, user, updateProfile: authUpdateProfile, uploadAvatar: authUploadAvatar } = useAuth();
  const { theme, setTheme, isSystem } = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [selectedRole, setSelectedRole] = useState(role || 'user');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef(null);

  // Keep fullName and role synced if profile loads asynchronously
  React.useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    if (role) {
      setSelectedRole(role);
    }
  }, [profile?.full_name, role]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setSaveStatus(null);
    setSaveError(null);
    try {
      if (authUpdateProfile) {
        await authUpdateProfile({ full_name: fullName.trim(), role: selectedRole });
      } else {
        await updateProfile(profile.id, { full_name: fullName.trim(), role: selectedRole });
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes.');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setSaveError('Please select an image file (PNG, JPG, WebP, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Image must be smaller than 5 MB.');
      return;
    }

    setUploadingAvatar(true);
    setSaveError(null);
    try {
      if (authUploadAvatar) {
        await authUploadAvatar(file);
      } else {
        await uploadAvatar(profile.id, file);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const avatarInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : (profile?.email?.[0] || 'U').toUpperCase();

  const avatarBg = { admin: 'bg-purple-600', developer: 'bg-indigo-600', user: 'bg-cyan-700' }[role] || 'bg-slate-700';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-main)]">Profile & Preferences</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your account information, theme preferences, and avatar</p>
      </div>

      {/* Account Info Card */}
      <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden shadow-sm transition-colors">
        {/* Avatar section */}
        <div className="flex items-center gap-5 p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
          <div className="relative group">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile avatar"
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[var(--border-card)]"
              />
            ) : (
              <div className={`h-20 w-20 rounded-2xl ${avatarBg} flex items-center justify-center text-xl font-bold text-white ring-2 ring-[var(--border-card)]`}>
                {avatarInitials}
              </div>
            )}
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Change avatar"
            >
              {uploadingAvatar ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--text-main)]">
              {profile?.full_name || 'Loading profile...'}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{profile?.email || '—'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Shield size={10} />
                {role ? (role.charAt(0).toUpperCase() + role.slice(1)) : 'Role unavailable'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={15} />
              <span>Profile updated successfully.</span>
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle size={15} />
              <span>{saveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                <User size={12} className="text-indigo-500" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-input)] px-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                <Mail size={12} className="text-[var(--text-dim)]" />
                Email Address
                <span className="text-[10px] text-[var(--text-dim)] font-normal">(read-only)</span>
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text-dim)] cursor-not-allowed"
              />
            </div>

            {/* Assigned Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                <Shield size={12} className="text-indigo-500" />
                Account Role
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-input)] px-3 text-sm text-[var(--text-main)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors capitalize cursor-pointer font-medium"
              >
                <option value="developer">Developer (Fixes, Repos &amp; PRs)</option>
                <option value="user">User (Tickets &amp; Issue Reporting)</option>
                <option value="admin">Admin (Governance &amp; Controls)</option>
              </select>
            </div>

            {/* Member since */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                <Clock size={12} className="text-[var(--text-dim)]" />
                Member since
              </label>
              <input
                type="text"
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                disabled
                className="h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text-dim)] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving || !fullName.trim()}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : <Save size={14} />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Appearance & Theme Card */}
      <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Palette size={18} className="text-indigo-500" />
          <h2 className="text-base font-bold text-[var(--text-main)]">Theme & Appearance</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Select how Agentix looks to you. Choose light, dark, or sync automatically with your system preference.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Dark Mode Tile */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border text-center transition-all ${
              theme === 'dark' && !isSystem
                ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                : 'border-[var(--border-card)] bg-[var(--bg-secondary)] hover:border-[var(--border-focus)]'
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow-sm">
              <Sun size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-main)] block">Dark Mode</span>
              <span className="text-[10px] text-[var(--text-dim)]">Deep Carbon &amp; Slate</span>
            </div>
          </button>

          {/* Light Mode Tile */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border text-center transition-all ${
              theme === 'light' && !isSystem
                ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                : 'border-[var(--border-card)] bg-[var(--bg-secondary)] hover:border-[var(--border-focus)]'
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <Moon size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-main)] block">Light Mode</span>
              <span className="text-[10px] text-[var(--text-dim)]">Crisp Enterprise White</span>
            </div>
          </button>

          {/* System Default Tile */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border text-center transition-all ${
              isSystem
                ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                : 'border-[var(--border-card)] bg-[var(--bg-secondary)] hover:border-[var(--border-focus)]'
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-700 to-slate-200 flex items-center justify-center text-cyan-400 shadow-sm">
              <Laptop size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-main)] block">System Preference</span>
              <span className="text-[10px] text-[var(--text-dim)]">Auto (prefers-color-scheme)</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
