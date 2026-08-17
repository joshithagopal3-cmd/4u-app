import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { PageHeader, Spinner, Avatar, Alert, StatCard } from '../components/common';
import { getPointsTier, DEPARTMENTS } from '../utils/helpers';
import toast from 'react-hot-toast';

const InputField = ({ label, name, value, onChange, placeholder, type = 'text', hint }) => (
  <div>
    <label className="label">{label}</label>
    <input
      type={type} name={name} value={value || ''}
      onChange={onChange} placeholder={placeholder}
      className="input"
    />
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const tier = getPointsTier(user?.points || 0);

  const [form, setForm] = useState({
    name: '', bio: '', phone: '', linkedIn: '', github: '', portfolio: '',
    profileVisibility: 'college',
    skills: '',
    codingProfiles: { leetcode: '', codechef: '', codeforces: '' },
  });
  const [loading, setLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setForm({
        name:               user.name || '',
        bio:                user.bio || '',
        phone:              user.phone || '',
        linkedIn:           user.linkedIn || '',
        github:             user.github || '',
        portfolio:          user.portfolio || '',
        profileVisibility:  user.profileVisibility || 'college',
        skills:             (user.skills || []).join(', '),
        codingProfiles: {
          leetcode:   user.codingProfiles?.leetcode || '',
          codechef:   user.codingProfiles?.codechef || '',
          codeforces: user.codingProfiles?.codeforces || '',
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleCodingChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, codingProfiles: { ...f.codingProfiles, [name]: value } }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await authAPI.updateProfile(payload);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match'); return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setPwLoading(true);
    try {
      await authAPI.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const completeness = () => {
    const fields = [form.bio, form.phone, form.skills, form.linkedIn, form.github, form.codingProfiles.leetcode];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const tabs = [
    { id: 'profile',  label: '👤 Profile' },
    { id: 'coding',   label: '💻 Coding' },
    { id: 'privacy',  label: '🔒 Privacy' },
    { id: 'password', label: '🔑 Password' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="My Profile" subtitle="Manage your account and preferences" />

      {/* Profile summary card */}
      <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <Avatar name={user?.name} size="xl" />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <p className="text-slate-400 text-xs mt-1">
            {user?.department} · Year {user?.year} · {user?.rollNumber}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
            <span className={`badge ${tier.bg} ${tier.color} font-semibold`}>{tier.icon} {tier.label}</span>
            <span className="badge-blue">{user?.points} pts</span>
          </div>
        </div>
        {/* Completeness meter */}
        <div className="text-center min-w-[80px]">
          <div className="relative w-16 h-16 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#5a6af4" strokeWidth="3"
                strokeDasharray={`${completeness()} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-700">{completeness()}%</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Profile complete</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        {/* ── Profile Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="card p-6 space-y-5">
            <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
            <div>
              <label className="label">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange}
                placeholder="Tell others a bit about yourself…"
                className="textarea h-24" maxLength={500} />
              <p className="text-xs text-slate-400 mt-1">{(form.bio || '').length}/500</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
              <div>
                <label className="label">Department</label>
                <input className="input bg-slate-50" value={user?.department || ''} disabled />
              </div>
            </div>
            <div>
              <label className="label">Skills</label>
              <input name="skills" value={form.skills} onChange={handleChange}
                placeholder="JavaScript, Python, React, Machine Learning…"
                className="input" />
              <p className="text-xs text-slate-400 mt-1">Comma-separated list of skills</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="LinkedIn URL" name="linkedIn" value={form.linkedIn} onChange={handleChange} placeholder="linkedin.com/in/you" />
              <InputField label="GitHub URL" name="github" value={form.github} onChange={handleChange} placeholder="github.com/you" />
              <InputField label="Portfolio URL" name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="yourportfolio.dev" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <><Spinner size="sm" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── Coding Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'coding' && (
          <div className="card p-6 space-y-5">
            <Alert type="info">
              Add your usernames below. Your stats will be fetched automatically on the Coding Stats page.
            </Alert>
            <div className="space-y-4">
              {[
                { name: 'leetcode', label: '🟡 LeetCode Username', placeholder: 'your-leetcode-username', link: 'leetcode.com' },
                { name: 'codechef', label: '🍴 CodeChef Username', placeholder: 'your-codechef-username', link: 'codechef.com' },
                { name: 'codeforces', label: '💙 Codeforces Handle', placeholder: 'your-cf-handle', link: 'codeforces.com' },
              ].map(p => (
                <div key={p.name}>
                  <label className="label">{p.label}</label>
                  <div className="flex gap-2">
                    <input name={p.name} value={form.codingProfiles[p.name]} onChange={handleCodingChange}
                      placeholder={p.placeholder} className="input flex-1" />
                    {form.codingProfiles[p.name] && (
                      <a href={`https://${p.link}/users/${form.codingProfiles[p.name]}`}
                        target="_blank" rel="noreferrer"
                        className="btn-secondary btn-sm whitespace-nowrap">View Profile</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <><Spinner size="sm" /> Saving…</> : 'Save Profiles'}
              </button>
            </div>
          </div>
        )}

        {/* ── Privacy Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'privacy' && (
          <div className="card p-6 space-y-5">
            <div>
              <label className="label">Profile Visibility</label>
              <p className="text-xs text-slate-400 mb-3">Controls who can see your full profile</p>
              <div className="space-y-3">
                {[
                  { value: 'public',  icon: '🌍', title: 'Public', desc: 'Anyone can view your profile' },
                  { value: 'college', icon: '🏫', title: 'College Only', desc: 'Only logged-in users can view your profile' },
                  { value: 'private', icon: '🔒', title: 'Private', desc: 'Only teachers and admins can view your profile' },
                ].map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${form.profileVisibility === opt.value ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="profileVisibility" value={opt.value}
                      checked={form.profileVisibility === opt.value}
                      onChange={handleChange} className="sr-only" />
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-medium text-slate-800">{opt.title}</p>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                    </div>
                    {form.profileVisibility === opt.value && (
                      <span className="ml-auto text-primary-600">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <><Spinner size="sm" /> Saving…</> : 'Save Privacy Settings'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ── Password Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="card p-6 space-y-5">
          <div>
            <label className="label">Current Password</label>
            <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              className="input" placeholder="Your current password" required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              className="input" placeholder="Min. 6 characters" required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
              className="input" placeholder="Repeat new password" required />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={pwLoading}>
              {pwLoading ? <><Spinner size="sm" /> Changing…</> : 'Change Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
