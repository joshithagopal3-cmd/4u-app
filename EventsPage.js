import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks';
import { eventsAPI } from '../utils/api';
import { PageHeader, EmptyState, PageSpinner, SelectFilter } from '../components/common';
import { formatDate, getCategoryMeta, isEventPast, isEventSoon, truncate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['technical','cultural','sports','workshop','hackathon','seminar','placement','other'];

const EventCard = ({ event }) => {
  const meta = getCategoryMeta(event.category);
  const past = isEventPast(event.date);
  const soon = isEventSoon(event.date);

  return (
    <Link to={`/events/${event._id}`}
      className={`card-hover flex flex-col h-full ${past ? 'opacity-60' : ''}`}>
      {/* Banner or gradient header */}
      <div className={`relative h-32 rounded-t-2xl bg-gradient-to-br ${
        { technical:'from-blue-500 to-blue-700', cultural:'from-purple-500 to-pink-600',
          sports:'from-emerald-500 to-teal-600', workshop:'from-orange-400 to-orange-600',
          hackathon:'from-red-500 to-red-700', seminar:'from-slate-600 to-slate-800',
          placement:'from-green-600 to-emerald-700', other:'from-primary-500 to-primary-700' }[event.category] || 'from-primary-500 to-primary-700'
      } flex items-center justify-center overflow-hidden`}>
        {event.banner
          ? <img src={event.banner} alt="" className="w-full h-full object-cover" />
          : <span className="text-5xl">{meta.emoji}</span>
        }
        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <span className={`badge text-white text-[10px] ${
            event.eventType === 'external' ? 'bg-black/40' : 'bg-white/20'}`}>
            {event.eventType === 'external' ? '🌍 External' : '🏫 Internal'}
          </span>
          {event.isOnline && <span className="badge bg-white/20 text-white text-[10px]">🌐 Online</span>}
        </div>
        {soon && !past && (
          <div className="absolute top-2 right-2">
            <span className="badge bg-amber-500 text-white text-[10px] animate-pulse-slow">🔥 Soon</span>
          </div>
        )}
        {past && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="badge bg-black/50 text-white">Completed</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Category + points */}
        <div className="flex items-center justify-between mb-2">
          <span className={`${meta.color} text-[11px]`}>{meta.label}</span>
          <span className="text-xs text-slate-400 font-medium">+{event.pointsForAttending} pts</span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">{event.title}</h3>
        <p className="text-xs text-slate-500 flex-1 mb-3">{truncate(event.shortDescription || event.description, 70)}</p>

        <div className="space-y-1.5 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>📅</span> {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{event.isOnline ? '🌐' : '📍'}</span>
            <span className="truncate">{event.isOnline ? 'Online Event' : event.location || 'TBA'}</span>
          </div>
        </div>

        {/* Eligibility indicator */}
        {event.isEligible !== undefined && (
          <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 ${
            event.isEligible
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'
          }`}>
            {event.isEligible ? '✓ You are eligible' : '⚠ Not eligible — can request access'}
          </div>
        )}

        {event.isRegistered && (
          <div className="mt-2 badge-blue justify-center w-full text-xs py-1">✓ Registered</div>
        )}
      </div>
    </Link>
  );
};

export const EventsPage = () => {
  const { isStudent, isTeacher, isAdmin } = useAuth();
  const [filters, setFilters] = useState({ category: '', eventType: '', upcoming: 'true', search: '' });
  const setFilter = (k) => (v) => setFilters(f => ({ ...f, [k]: v }));

  const { data, loading } = useFetch(
    () => eventsAPI.getAll(filters),
    [filters.category, filters.eventType, filters.upcoming, filters.search]
  );

  const events = data?.events || [];

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle={`${data?.total || 0} events found`}
        action={(isTeacher || isAdmin) && (
          <Link to="/events/create" className="btn-primary">
            <span>+</span> Create Event
          </Link>
        )}
      />

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          className="input max-w-xs text-sm" placeholder="🔍 Search events…"
          value={filters.search}
          onChange={e => setFilter('search')(e.target.value)}
        />
        <SelectFilter
          value={filters.category}
          onChange={setFilter('category')}
          options={CATEGORIES.map(c => ({ value: c, label: getCategoryMeta(c).label }))}
          placeholder="All Categories"
          className="w-44"
        />
        <SelectFilter
          value={filters.eventType}
          onChange={setFilter('eventType')}
          options={[{ value: 'internal', label: 'Internal' }, { value: 'external', label: 'External' }]}
          placeholder="All Types"
          className="w-36"
        />
        <div className="flex gap-1 ml-auto">
          {[{ v: 'true', l: 'Upcoming' }, { v: '', l: 'All' }].map(opt => (
            <button key={opt.v}
              onClick={() => setFilter('upcoming')(opt.v)}
              className={`btn btn-sm ${filters.upcoming === opt.v ? 'btn-primary' : 'btn-ghost'}`}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? <PageSpinner /> : events.length === 0 ? (
        <EmptyState icon="📅" title="No events found" subtitle="Try changing the filters"
          action={<button onClick={() => setFilters({ category: '', eventType: '', upcoming: '', search: '' })}
            className="btn-secondary">Clear filters</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {events.map((event, i) => (
            <div key={event._id} className={`animate-in animate-in-delay-${Math.min(i % 4 + 1, 4)}`}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
