import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks';
import { usersAPI } from '../utils/api';
import { PageHeader, PageSpinner, SelectFilter, Avatar } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getPointsTier, DEPARTMENTS, YEARS } from '../utils/helpers';

const TABS = [
  { value: 'points',   label: '🏆 Points',      key: 'points' },
  { value: 'leetcode', label: '🟡 LeetCode',     key: 'leetcodeSolved' },
  { value: 'codechef', label: '🍴 CodeChef',     key: 'codechefRating' },
];

export const LeaderboardPage = () => {
  const { user } = useAuth();
  const [dept, setDept]       = useState('');
  const [year, setYear]       = useState('');
  const [sortBy, setSortBy]   = useState('points');

  const { data, loading } = useFetch(
    () => usersAPI.getLeaderboard({ department: dept, year }),
    [dept, year]
  );

  const leaderboard = [...(data?.leaderboard || [])].sort((a, b) => {
    const tab = TABS.find(t => t.value === sortBy);
    return (b[tab?.key || 'points'] || 0) - (a[tab?.key || 'points'] || 0);
  }).map((s, i) => ({ ...s, rank: i + 1 }));

  const myRank = leaderboard.findIndex(s => s._id?.toString() === user?._id?.toString()) + 1;

  return (
    <div>
      <PageHeader title="Leaderboard" subtitle="Top performers across the college" />

      {/* My rank banner */}
      {myRank > 0 && (
        <div className="card p-4 mb-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
              #{myRank}
            </div>
            <div>
              <p className="font-semibold">Your current rank</p>
              <p className="text-primary-200 text-xs">{user?.points} total points</p>
            </div>
          </div>
          <Link to="/coding" className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0">
            Improve →
          </Link>
        </div>
      )}

      {/* Filters + sort tabs */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
        <SelectFilter
          value={dept} onChange={setDept}
          options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
          placeholder="All Departments" className="w-44"
        />
        <SelectFilter
          value={year} onChange={setYear}
          options={YEARS.map(y => ({ value: y, label: `Year ${y}` }))}
          placeholder="All Years" className="w-32"
        />
        <div className="ml-auto flex gap-1 bg-slate-100 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t.value} onClick={() => setSortBy(t.value)}
              className={`btn btn-sm ${sortBy === t.value ? 'btn-primary shadow-sm' : 'btn-ghost'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((s, i) => {
            const positions = [{ label: '2nd', h: 'h-24', medal: '🥈' }, { label: '1st', h: 'h-32', medal: '🥇' }, { label: '3rd', h: 'h-16', medal: '🥉' }];
            const pos = positions[i];
            const tier = getPointsTier(s.points);
            const isMe = s._id?.toString() === user?._id?.toString();
            return (
              <div key={s._id} className={`card p-4 flex flex-col items-center text-center ${isMe ? 'ring-2 ring-primary-400' : ''}`}>
                <div className="text-2xl mb-1">{pos.medal}</div>
                <Avatar name={s.name} size="md" className="mb-2" />
                <p className="text-xs font-bold text-slate-800 truncate w-full">{s.name}</p>
                <p className="text-[10px] text-slate-400">{s.department} · Y{s.year}</p>
                <p className={`text-sm font-bold mt-1 ${tier.color}`}>{s.points} pts</p>
                <div className={`${pos.h} w-full mt-2 rounded-xl ${
                  i === 1 ? 'bg-gradient-to-t from-amber-400 to-yellow-300' :
                  i === 0 ? 'bg-gradient-to-t from-slate-400 to-slate-300' :
                            'bg-gradient-to-t from-orange-400 to-orange-300'
                }`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      {loading ? <PageSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Rank', 'Student', 'Dept', 'Year', 'Points', 'LC Solved', 'CC Rating', 'Badges'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaderboard.map((s) => {
                const tier = getPointsTier(s.points);
                const isMe = s._id?.toString() === user?._id?.toString();
                return (
                  <tr key={s._id}
                    className={`hover:bg-slate-50 transition-colors ${isMe ? 'bg-primary-50 hover:bg-primary-50' : ''}`}>
                    <td className="px-4 py-3 font-bold text-slate-500 w-12">
                      {s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : s.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <Link to={`/users/${s._id}/profile`}
                            className={`font-medium hover:underline ${isMe ? 'text-primary-700' : 'text-slate-800'}`}>
                            {s.name}
                          </Link>
                          {isMe && <span className="badge-blue text-[10px] ml-1">You</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{s.department}</td>
                    <td className="px-4 py-3 text-slate-500">Y{s.year}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${tier.color}`}>{s.points}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.leetcodeSolved || 0}</td>
                    <td className="px-4 py-3 text-slate-600">{s.codechefRating || 0}</td>
                    <td className="px-4 py-3">
                      <span className="text-amber-500">{s.badges > 0 ? '🏅'.repeat(Math.min(s.badges, 5)) : '—'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">🏆</div>
              <p>No students found with selected filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
