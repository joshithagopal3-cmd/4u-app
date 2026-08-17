import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks';
import { usersAPI } from '../utils/api';
import { StatCard, PageSpinner, Avatar, EmptyState } from '../components/common';
import { formatDate, getCategoryMeta, getPointsTier, isEventSoon } from '../utils/helpers';

const EventChip = ({ reg }) => {
  const meta = getCategoryMeta(reg.event?.category);
  const soon = isEventSoon(reg.event?.date);
  return (
    <Link to={`/events/${reg.event?._id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate group-hover:text-primary-700">{reg.event?.title}</p>
        <p className="text-xs text-slate-400">{formatDate(reg.event?.date)}</p>
      </div>
      {soon && <span className="badge-orange text-[10px]">Soon</span>}
      {reg.attended && <span className="badge-green text-[10px]">✓ Attended</span>}
      {!reg.attended && reg.overrideStatus === 'pending' && <span className="badge-orange text-[10px]">Pending</span>}
    </Link>
  );
};

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { data, loading } = useFetch(() => usersAPI.getStudentDashboard());
  const tier = getPointsTier(user?.points || 0);

  if (loading) return <PageSpinner />;

  const { stats = {}, recentRegistrations = [], upcomingEvents = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">Good day,</p>
            <h1 className="text-3xl font-bold mb-2">{user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-primary-200 text-sm">{user?.department} · Year {user?.year}</p>
          </div>
          <div className={`${tier.bg} rounded-2xl p-3 text-center min-w-[80px]`}>
            <div className="text-2xl">{tier.icon}</div>
            <p className={`text-xs font-bold ${tier.color}`}>{tier.label}</p>
            <p className="text-xs text-slate-500">{user?.points} pts</p>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Registered', value: stats.eventsRegistered || 0 },
            { label: 'Attended', value: stats.eventsAttended || 0 },
            { label: 'Pending', value: stats.pendingRequests || 0 },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-primary-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🏆" label="Total Points" value={stats.totalPoints || 0}
          color="bg-yellow-100 text-yellow-700" />
        <StatCard icon="💻" label="LeetCode Solved" value={stats.leetcodeSolved || 0}
          sub="problems solved" color="bg-orange-100 text-orange-700" />
        <StatCard icon="⭐" label="CodeChef Rating" value={stats.codechefRating || 0}
          color="bg-purple-100 text-purple-700" />
        <StatCard icon="📅" label="Events Attended" value={stats.eventsAttended || 0}
          color="bg-emerald-100 text-emerald-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">My Events</h2>
            <Link to="/my-events" className="text-xs text-primary-600 font-medium hover:underline">View all →</Link>
          </div>
          {recentRegistrations.length === 0 ? (
            <EmptyState icon="🎫" title="No events yet"
              subtitle="Register for an event to see it here"
              action={<Link to="/events" className="btn-primary btn-sm">Browse Events</Link>} />
          ) : (
            <div className="space-y-1">
              {recentRegistrations.slice(0, 5).map(reg => (
                <EventChip key={reg._id} reg={reg} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Upcoming Events</h2>
            <Link to="/events" className="text-xs text-primary-600 font-medium hover:underline">All events →</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <EmptyState icon="📅" title="No upcoming events" subtitle="Check back soon!" />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => {
                const meta = getCategoryMeta(event.category);
                return (
                  <Link key={event._id} to={`/events/${event._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{event.title}</p>
                      <p className="text-xs text-slate-400">{formatDate(event.date)} · {event.isOnline ? '🌐 Online' : `📍 ${event.location}`}</p>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-primary-600">+{event.pointsForAttending}pts</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/events',      icon: '🔍', label: 'Find Events',    desc: 'Browse & register' },
          { to: '/coding',      icon: '💻', label: 'Coding Stats',   desc: 'LeetCode & CodeChef' },
          { to: '/leaderboard', icon: '🏆', label: 'Leaderboard',    desc: 'See your rank' },
          { to: '/resume',      icon: '📄', label: 'Resume Builder', desc: 'Generate your resume' },
        ].map(l => (
          <Link key={l.to} to={l.to}
            className="card-hover p-5 text-center group">
            <div className="text-3xl mb-2">{l.icon}</div>
            <p className="text-sm font-semibold text-slate-800 group-hover:text-primary-700">{l.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
