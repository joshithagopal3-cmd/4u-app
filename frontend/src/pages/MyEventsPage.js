import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks';
import { registrationsAPI } from '../utils/api';
import { PageHeader, EmptyState, PageSpinner, Tabs } from '../components/common';
import { formatDate, getCategoryMeta } from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { value: 'all',       label: 'All',       icon: '📋' },
  { value: 'upcoming',  label: 'Upcoming',  icon: '📅' },
  { value: 'attended',  label: 'Attended',  icon: '✅' },
  { value: 'pending',   label: 'Pending',   icon: '⏳' },
];

const RegistrationCard = ({ reg, onCancel }) => {
  const event = reg.event;
  if (!event) return null;
  const meta = getCategoryMeta(event.category);
  const isPast = new Date(event.date) < new Date();

  const statusBadge = () => {
    if (reg.attended) return <span className="badge-green">✓ Attended</span>;
    if (reg.overrideStatus === 'pending') return <span className="badge-orange">⏳ Awaiting Approval</span>;
    if (reg.overrideStatus === 'rejected') return <span className="badge-red">✗ Request Rejected</span>;
    if (isPast) return <span className="badge-gray">Missed</span>;
    return <span className="badge-blue">Registered</span>;
  };

  return (
    <div className="card p-5 flex flex-col sm:flex-row gap-4 animate-in">
      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 
        bg-gradient-to-br ${
          { technical:'from-blue-100 to-blue-200', cultural:'from-purple-100 to-purple-200',
            sports:'from-emerald-100 to-emerald-200', workshop:'from-orange-100 to-orange-200',
            hackathon:'from-red-100 to-red-200', seminar:'from-slate-100 to-slate-200',
            placement:'from-green-100 to-green-200', other:'from-primary-100 to-primary-200'
          }[event.category] || 'from-primary-100 to-primary-200'}`}>
        {meta.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <Link to={`/events/${event._id}`}
            className="text-sm font-semibold text-slate-900 hover:text-primary-700 transition-colors">
            {event.title}
          </Link>
          {statusBadge()}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>📅 {formatDate(event.date)}</span>
          <span>{event.isOnline ? '🌐 Online' : `📍 ${event.location || 'TBA'}`}</span>
          <span className={meta.color}>{meta.label}</span>
          {reg.pointsEarned > 0 && <span className="text-amber-600 font-medium">+{reg.pointsEarned} pts earned</span>}
        </div>

        {/* Rejection note */}
        {reg.overrideStatus === 'rejected' && reg.overrideRejectionNote && (
          <p className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-1.5">
            Reason: {reg.overrideRejectionNote}
          </p>
        )}

        {/* Attend anyway reason */}
        {reg.attendAnyway && reg.overrideStatus === 'pending' && (
          <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
            Your reason: "{reg.attendAnywayReason}"
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to={`/events/${event._id}`} className="btn-secondary btn-sm">View</Link>
        {!isPast && !reg.attended && (
          <button
            onClick={() => onCancel(reg._id)}
            className="btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export const MyEventsPage = () => {
  const [tab, setTab] = useState('all');
  const { data, loading, refetch } = useFetch(() => registrationsAPI.getMine());

  const handleCancel = async (regId) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      await registrationsAPI.cancel(regId);
      toast.success('Registration cancelled');
      refetch();
    } catch { toast.error('Failed to cancel'); }
  };

  if (loading) return <PageSpinner />;

  const regs = data?.registrations || [];

  const filtered = regs.filter(r => {
    const isPast = r.event && new Date(r.event.date) < new Date();
    if (tab === 'upcoming') return !isPast && !r.attended;
    if (tab === 'attended') return r.attended;
    if (tab === 'pending')  return r.overrideStatus === 'pending';
    return true;
  });

  const counts = {
    all:      regs.length,
    upcoming: regs.filter(r => r.event && new Date(r.event.date) >= new Date() && !r.attended).length,
    attended: regs.filter(r => r.attended).length,
    pending:  regs.filter(r => r.overrideStatus === 'pending').length,
  };

  return (
    <div>
      <PageHeader
        title="My Events"
        subtitle="Track your registrations and attendance"
        action={<Link to="/events" className="btn-primary">Browse Events</Link>}
      />

      <div className="mb-6">
        <Tabs
          tabs={STATUS_TABS.map(t => ({ ...t, count: counts[t.value] }))}
          active={tab}
          onChange={setTab}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={tab === 'attended' ? '✅' : tab === 'pending' ? '⏳' : '🎫'}
          title={tab === 'all' ? 'No registrations yet' : `No ${tab} events`}
          subtitle={tab === 'all' ? "Start exploring events and register!" : "Nothing to show here."}
          action={tab === 'all' && <Link to="/events" className="btn-primary">Browse Events</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(reg => (
            <RegistrationCard key={reg._id} reg={reg} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
};
