import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks';
import { codingAPI, authAPI } from '../utils/api';
import { PageHeader, PageSpinner, StatCard, Spinner, Alert } from '../components/common';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max, color = 'bg-primary-500', label, count }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className="font-medium text-slate-700">{count}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ── LeetCode Card ─────────────────────────────────────────────────────────────
const LeetCodeCard = ({ stats, username }) => {
  const total = stats.easySolved + stats.mediumSolved + stats.hardSolved;
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🟡</div>
          <div>
            <h3 className="font-bold text-slate-900">LeetCode</h3>
            <a href={`https://leetcode.com/${username}`} target="_blank" rel="noreferrer"
              className="text-xs text-primary-600 hover:underline">@{username}</a>
          </div>
        </div>
        {stats.isMock && <span className="badge-orange text-[10px]">Mock Data</span>}
      </div>

      {/* Big number */}
      <div className="text-center py-4 mb-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
        <div className="text-5xl font-black text-amber-600">{stats.totalSolved}</div>
        <div className="text-xs text-slate-500 mt-1">problems solved</div>
        {stats.ranking > 0 && (
          <div className="text-xs text-slate-400 mt-0.5">
            Global rank #{stats.ranking?.toLocaleString()}
          </div>
        )}
      </div>

      {/* Difficulty breakdown */}
      <div className="space-y-3 mb-5">
        <ProgressBar label="Easy"   count={stats.easySolved}   value={stats.easySolved}   max={total || 1} color="bg-emerald-400" />
        <ProgressBar label="Medium" count={stats.mediumSolved} value={stats.mediumSolved} max={total || 1} color="bg-amber-400" />
        <ProgressBar label="Hard"   count={stats.hardSolved}   value={stats.hardSolved}   max={total || 1} color="bg-red-400" />
      </div>

      {/* Contest stats */}
      {stats.contestRating > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <div className="text-center">
            <div className="text-xl font-bold text-primary-700">{stats.contestRating}</div>
            <div className="text-xs text-slate-400">Contest Rating</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary-700">{stats.contestsAttended}</div>
            <div className="text-xs text-slate-400">Contests</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── CodeChef Card ─────────────────────────────────────────────────────────────
const CodeChefCard = ({ stats, username }) => {
  const starCount = parseInt(stats.stars) || 1;
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">🍴</div>
          <div>
            <h3 className="font-bold text-slate-900">CodeChef</h3>
            <a href={`https://www.codechef.com/users/${username}`} target="_blank" rel="noreferrer"
              className="text-xs text-primary-600 hover:underline">@{username}</a>
          </div>
        </div>
        {stats.isMock && <span className="badge-orange text-[10px]">Mock Data</span>}
      </div>

      {/* Rating + Stars */}
      <div className="text-center py-4 mb-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
        <div className="text-5xl font-black text-orange-600">{stats.rating}</div>
        <div className="text-amber-500 text-xl mt-1">{'★'.repeat(starCount)}{'☆'.repeat(Math.max(0, 7 - starCount))}</div>
        <div className="text-xs text-slate-500 mt-1">{stats.stars}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Problems Solved', value: stats.problemsSolved },
          { label: 'Contests', value: stats.contestsParticipated },
          { label: 'Highest Rating', value: stats.highestRating },
          { label: 'Current Rating', value: stats.rating },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-slate-800">{value || 0}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── No Profile Placeholder ────────────────────────────────────────────────────
const NoPlatformCard = ({ platform, emoji, linkTo }) => (
  <div className="card p-6 flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-slate-200">
    <div className="text-4xl mb-3">{emoji}</div>
    <h3 className="font-semibold text-slate-700 mb-1">{platform} not linked</h3>
    <p className="text-xs text-slate-400 mb-4">Add your {platform} username to see your stats here.</p>
    <Link to="/profile" className="btn-primary btn-sm">Add Username in Profile</Link>
  </div>
);

export const CodingPage = () => {
  const { user, updateUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useFetch(() => codingAPI.getMyStats());
  const { data: lbData } = useFetch(() => codingAPI.getLeaderboard({ department: user?.department }), [user?.department]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await codingAPI.getMyStats();
      toast.success('Stats refreshed!');
      // update cached user
      const meRes = await authAPI.getMe();
      updateUser(meRes.data.user);
      refetch();
    } catch { toast.error('Refresh failed'); }
    finally { setRefreshing(false); }
  };

  const stats = data?.stats || {};
  const lcSolved = stats.leetcode?.totalSolved || user?.codingStats?.leetcode?.totalSolved || 0;
  const ccRating = stats.codechef?.rating || user?.codingStats?.codechef?.rating || 0;

  return (
    <div>
      <PageHeader
        title="Coding Stats"
        subtitle="Track your competitive programming journey"
        action={
          <button onClick={handleRefresh} className="btn-secondary" disabled={refreshing}>
            {refreshing ? <><Spinner size="sm" /> Refreshing…</> : '🔄 Refresh Stats'}
          </button>
        }
      />

      {loading ? <PageSpinner /> : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <StatCard icon="🟡" label="LeetCode Solved"   value={lcSolved}  color="bg-amber-100 text-amber-700" />
            <StatCard icon="🍴" label="CodeChef Rating"   value={ccRating}  color="bg-orange-100 text-orange-700" />
            <StatCard icon="🏆" label="Total Points"      value={user?.points || 0} color="bg-primary-100 text-primary-700" />
            <StatCard icon="🎯" label="Dept. Rank"
              value={lbData?.leaderboard?.findIndex(l => l._id?.toString() === user?._id?.toString()) + 1 || '—'}
              sub={`in ${user?.department}`} color="bg-emerald-100 text-emerald-700" />
          </div>

          {/* Platform tip */}
          {!user?.codingProfiles?.leetcode && !user?.codingProfiles?.codechef && (
            <Alert type="info" className="mb-6">
              Link your coding profiles in <Link to="/profile" className="underline font-medium">Profile Settings</Link> to see real-time stats.
            </Alert>
          )}

          {/* Platform cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {user?.codingProfiles?.leetcode
              ? <LeetCodeCard stats={stats.leetcode || user.codingStats?.leetcode || {}} username={user.codingProfiles.leetcode} />
              : <NoPlatformCard platform="LeetCode" emoji="🟡" />
            }
            {user?.codingProfiles?.codechef
              ? <CodeChefCard stats={stats.codechef || user.codingStats?.codechef || {}} username={user.codingProfiles.codechef} />
              : <NoPlatformCard platform="CodeChef" emoji="🍴" />
            }
          </div>

          {/* Dept leaderboard preview */}
          {lbData?.leaderboard?.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">Department Leaderboard ({user?.department})</h2>
                <Link to="/leaderboard" className="text-xs text-primary-600 hover:underline">Full leaderboard →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['#', 'Student', 'Points', 'LC Solved', 'CC Rating'].map(h => (
                        <th key={h} className="pb-3 text-left font-medium text-slate-400 text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lbData.leaderboard.slice(0, 8).map((s, i) => (
                      <tr key={i} className={`${s._id?.toString() === user?._id?.toString() ? 'bg-primary-50' : ''}`}>
                        <td className="py-2.5 font-bold text-slate-500 w-8">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </td>
                        <td className="py-2.5">
                          <span className={`font-medium ${s._id?.toString() === user?._id?.toString() ? 'text-primary-700' : 'text-slate-800'}`}>
                            {s.name} {s._id?.toString() === user?._id?.toString() && <span className="badge-blue text-[10px] ml-1">You</span>}
                          </span>
                        </td>
                        <td className="py-2.5 font-semibold text-amber-600">{s.points}</td>
                        <td className="py-2.5 text-slate-600">{s.leetcodeSolved}</td>
                        <td className="py-2.5 text-slate-600">{s.codechefRating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
