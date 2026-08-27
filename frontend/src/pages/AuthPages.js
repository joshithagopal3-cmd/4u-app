import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common';
import { DEPARTMENTS, YEARS } from '../utils/helpers';
import toast from 'react-hot-toast';

// ── Login Page ────────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'student' ? '/dashboard' : '/teacher');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick login demo buttons
  const demoLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'student' ? '/dashboard' : '/teacher');
    } catch {
      toast.error('Demo login failed — make sure the server is running and seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 text-white">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold mb-8">
          4U
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-4">
          Your campus,<br />
          <span className="text-primary-300">all in one place.</span>
        </h1>
        <p className="text-primary-200 text-lg max-w-sm leading-relaxed">
          Discover events, track your coding journey, build your portfolio — and never miss an opportunity again.
        </p>
        <div className="mt-12 grid grid-cols-3 gap-4">
          {[['📅','Events'], ['💻','Coding'], ['🏆','Rankings']].map(([e, l]) => (
            <div key={l} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{e}</div>
              <div className="text-xs text-primary-200">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-in">
          <div className="lg:hidden w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold mb-6">4U</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to continue to 4U App</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@college.edu"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          {/* Demo logins */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Student', email: 'student1@4uapp.edu', password: 'student1234' },
                { label: 'Teacher', email: 'priya@4uapp.edu',    password: 'teacher1234' },
                { label: 'Admin',   email: 'admin@4uapp.edu',    password: 'admin1234' },
              ].map(d => (
                <button key={d.label} onClick={() => demoLogin(d.email, d.password)}
                  className="btn-secondary btn-sm text-xs py-2" disabled={loading}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account? <Link to="/register" className="text-primary-600 font-medium hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Register Page ─────────────────────────────────────────────────────────────
export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', year: '', rollNumber: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'student' ? '/dashboard' : '/teacher');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 animate-in">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold mb-6">4U</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
        <p className="text-slate-500 text-sm mb-8">Join the 4U platform</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input className="input" placeholder="Your full name" value={form.name} onChange={set('name')} required />
            </div>
            <div className="col-span-2">
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@college.edu" value={form.email} onChange={set('email')} required />
            </div>
            <div className="col-span-2">
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
            </div>
            <div className="col-span-2">
              <label className="label">Role</label>
              <select className="select" value={form.role} onChange={set('role')}>
                <option value="student">Student</option>
                <option value="teacher">Teacher / Staff</option>
              </select>
            </div>
            {form.role === 'student' && (
              <>
                <div>
                  <label className="label">Department</label>
                  <select className="select" value={form.department} onChange={set('department')} required>
                    <option value="">Select dept.</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <select className="select" value={form.year} onChange={set('year')} required>
                    <option value="">Select year</option>
                    {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Roll Number</label>
                  <input className="input" placeholder="e.g. CSE001" value={form.rollNumber} onChange={set('rollNumber')} />
                </div>
              </>
            )}
          </div>
          <button type="submit" className="btn-primary w-full btn-lg mt-2" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
