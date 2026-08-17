import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks';
import { usersAPI } from '../utils/api';
import { PageSpinner, Avatar, StatCard } from '../components/common';
import { formatDate, getCategoryMeta, getPointsTier } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export const StudentProfilePage = () => {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { data, loading } = useFetch(() => usersAPI.getProfile(id), [id]);

  if (loading) return <PageSpinner />;
  if (!data?.user) return <div className="text-center py-20 text-slate-400">Profile not found or private</div>;

  const user = data.user;
  const tier = getPointsTier(user.points || 0);
  const isMe = me?._id?.toString() === id;

  return (
    <div className="max-w-3xl mx-auto animate-in">
      {/* Header card */}
      <div className="card p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar name={user.name} size="xl" />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              {isMe && <span className="badge-blue text-[10px]">You</span>}
              <span className={`badge ${tier.bg} ${tier.color} font-semibold`}>{tier.icon} {tier.label}</span>
            </div>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <p className="text-slate-400 text-xs mt-1">
              {user.department} Engineering · Year {user.year}
              {user.rollNumber && ` · ${user.rollNumber}`}
              {user.section && ` · Section ${user.section}`}
            </p>

            {user.bio && (
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">{user.bio}</p>
            )}

            {/* Social links */}
            <div className="flex flex-wrap gap-2 mt-3">
              {user.linkedIn  && <a href={user.linkedIn}  target="_blank" rel="noreferrer" className="btn-secondary btn-sm text-xs">🔗 LinkedIn</a>}
              {user.github    && <a href={user.github}    target="_blank" rel="noreferrer" className="btn-secondary btn-sm text-xs">🐙 GitHub</a>}
              {user.portfolio && <a href={user.portfolio} target="_blank" rel="noreferrer" className="btn-secondary btn-sm text-xs">🌐 Portfolio</a>}
              {isMe && <Link to="/profile" className="btn-primary btn-sm text-xs">✏ Edit Profile</Link>}
            </div>
          </div>

          {/* Points bubble */}
          <div className="text-center flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
              <div>
                <div className="text-lg font-black leading-none">{user.points}</div>
                <div className="text-[9px]">pts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        {user.skills?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-3">🛠 Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map(s => (
                <span key={s} className="badge-blue">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Coding stats */}
        {(user.codingStats?.leetcode?.totalSolved > 0 || user.codingStats?.codechef?.rating > 0) && (
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-3">💻 Coding Stats</h3>
            <div className="space-y-3">
              {user.codingStats?.leetcode?.totalSolved > 0 && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🟡</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-800">LeetCode</p>
                      {user.codingProfiles?.leetcode &&
                        <p className="text-xs text-amber-600">@{user.codingProfiles.leetcode}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-700">{user.codingStats.leetcode.totalSolved}</p>
                    <p className="text-xs text-amber-500">solved</p>
                  </div>
                </div>
              )}
              {user.codingStats?.codechef?.rating > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍴</span>
                    <div>
                      <p className="text-sm font-semibold text-orange-800">CodeChef</p>
                      {user.codingProfiles?.codechef &&
                        <p className="text-xs text-orange-600">@{user.codingProfiles.codechef}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-700">{user.codingStats.codechef.rating}</p>
                    <p className="text-xs text-orange-500">{user.codingStats.codechef.stars}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Participation history */}
      {data.participationHistory?.length > 0 && (
        <div className="card p-6 mt-6">
          <h3 className="font-bold text-slate-900 mb-4">🎫 Event Participation</h3>
          <div className="space-y-2">
            {data.participationHistory.map(reg => {
              const meta = reg.event ? getCategoryMeta(reg.event.category) : null;
              return (
                <div key={reg._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-xl">{meta?.emoji || '📅'}</span>
                  <div className="flex-1 min-w-0">
                    <Link to={`/events/${reg.event?._id}`}
                      className="text-sm font-medium text-slate-800 hover:text-primary-700 truncate block">
                      {reg.event?.title}
                    </Link>
                    <p className="text-xs text-slate-400">{reg.event?.date && formatDate(reg.event.date)}</p>
                  </div>
                  {reg.position && <span className="badge-orange text-xs">{reg.position}</span>}
                  {reg.pointsEarned > 0 && (
                    <span className="text-xs text-amber-600 font-semibold">+{reg.pointsEarned} pts</span>
                  )}
                  <span className="badge-green text-[10px]">Attended</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
