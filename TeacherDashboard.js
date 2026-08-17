import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks';
import { usersAPI } from '../utils/api';
import { PageHeader, PageSpinner, StatCard, SelectFilter, Avatar } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { formatDate, getCategoryMeta, getPointsTier, DEPARTMENTS, YEARS } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');

  const { data, loading } = useFetch(
    () => usersAPI.getTeacherDashboard({ department: dept, year }),
    [dept, year]
  );

  if (loading) return <PageSpinner />;

  const { stats = {}, topStudents = [], recentActivity = [] } = data || {};

  // Build dept distribution chart from students
  const deptData = (data?.students || []).reduce((acc, s) => {
    acc[s.department] = (acc[s.department] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(deptData).map(([dept, count]) => ({ dept, count }));

  const CHART_COLORS = ['#5a6af4','#f97316','#10b981','#8b5cf6','#ef4444','#06b6d4','#84cc16'];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">Teacher Dashboard</p>
            <h1 className="text-3xl font-bold mb-1">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-slate-400 text-sm">{user?.department} Department</p>
          </div>
          <div className="flex gap-3">
            <Link to="/events/create" className="btn btn-sm bg-white text-slate-900 hover:bg-slate-100 font-semibold">
              + Create Event
            </Link>
            <Link to="/teacher/overrides" className="btn btn-sm bg-amber-500 text-white hover:bg-amber-600 font-semibold relative">
              Requests
              {stats.pendingOverrides > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">
                  {stats.pendingOverrides}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: stats.totalStudents || 0, icon: '👥' },
            { label: 'Events Created', value: stats.totalEvents || 0,   icon: '📅' },
            { label: 'Pending Requests', value: stats.pendingOverrides || 0, icon: '⏳' },
            { label: 'Avg. Points', value: stats.avgPoints || 0, icon: '🏆' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SelectFilter value={dept} onChange={setDept}
          options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
          placeholder="All Departments" className="w-44" />
        <SelectFilter value={year} onChange={setYear}
          options={YEARS.map(y => ({ value: y, label: `Year ${y}` }))}
          placeholder="All Years" className="w-32" />
        {(dept || year) && (
          <button onClick={() => { setDept(''); setYear(''); }} className="btn-ghost btn-sm">
            × Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top students */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">Top Performers</h2>
            <Link to="/teacher/students" className="text-xs text-primary-600 hover:underline">All students →</Link>
          </div>
          {topStudents.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No students found</p>
          ) : (
            <div className="space-y-3">
              {topStudents.slice(0, 8).map((s, i) => {
                const tier = getPointsTier(s.points);
                return (
                  <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                      {i + 1}
                    </div>
                    <Avatar name={s.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <Link to={`/users/${s._id}/profile`}
                        className="text-sm font-semibold text-slate-800 hover:text-primary-700 truncate block">
                        {s.name}
                      </Link>
                      <p className="text-xs text-slate-400">{s.department} · Y{s.year} · {s.rollNumber}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${tier.color}`}>{s.points} pts</p>
                      <p className="text-[10px] text-slate-400">LC: {s.codingStats?.leetcode?.totalSolved || 0}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dept distribution chart */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 mb-5">Department Distribution</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="dept" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">No data</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-900">Recent Registrations</h2>
          <span className="badge-gray">{recentActivity.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Student', 'Event', 'Category', 'Date', 'Status'].map(h => (
                  <th key={h} className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentActivity.slice(0, 10).map(r => {
                const meta = r.event ? getCategoryMeta(r.event.category) : null;
                return (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.student?.name} size="sm" />
                        <div>
                          <Link to={`/users/${r.student?._id}/profile`}
                            className="font-medium text-slate-800 hover:text-primary-700">
                            {r.student?.name}
                          </Link>
                          <p className="text-xs text-slate-400">{r.student?.department} · Y{r.student?.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-700 font-medium">{r.event?.title}</td>
                    <td className="py-3">
                      {meta && <span className={meta.color}>{meta.emoji} {meta.label}</span>}
                    </td>
                    <td className="py-3 text-slate-400 text-xs">{r.event?.date && formatDate(r.event.date)}</td>
                    <td className="py-3">
                      {r.attended ? <span className="badge-green">Attended</span>
                        : r.overrideStatus === 'pending' ? <span className="badge-orange">Pending</span>
                        : <span className="badge-blue">Registered</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentActivity.length === 0 && (
            <p className="text-center py-8 text-slate-400">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};
