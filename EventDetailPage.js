import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks';
import { eventsAPI, registrationsAPI } from '../utils/api';
import { PageSpinner, Alert, Modal, Spinner, Avatar } from '../components/common';
import { formatDateTime, getCategoryMeta, isEventPast } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const EventDetailPage = () => {
  const { id } = useParams();
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();
  const [attendAnywayModal, setAttendAnywayModal] = useState(false);
  const [reason, setReason] = useState('');
  const [registering, setRegistering] = useState(false);

  const { data, loading, refetch } = useFetch(() => eventsAPI.getOne(id), [id]);

  if (loading) return <PageSpinner />;
  if (!data?.event) return <div className="text-center py-20 text-slate-400">Event not found</div>;

  const event = data.event;
  const registration = data.registration;
  const meta = getCategoryMeta(event.category);
  const past = isEventPast(event.date);

  const handleRegister = async (attendAnyway = false) => {
    setRegistering(true);
    try {
      const payload = { eventId: id };
      if (attendAnyway) { payload.attendAnyway = true; payload.attendAnywayReason = reason; }
      const res = await registrationsAPI.register(payload);
      toast.success(res.message);
      setAttendAnywayModal(false);
      refetch();
    } catch (err) {
      const msg = err.message || 'Registration failed';
      if (err.message?.includes('Attend Anyway') || err.message?.includes('eligible')) {
        setAttendAnywayModal(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your registration?')) return;
    try {
      await registrationsAPI.cancel(registration._id);
      toast.success('Registration cancelled');
      refetch();
    } catch { toast.error('Failed to cancel'); }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-3">
        ← Back to Events
      </button>

      {/* Banner */}
      <div className={`relative h-48 sm:h-64 rounded-3xl overflow-hidden bg-gradient-to-br 
        ${{ technical:'from-blue-500 to-blue-700', cultural:'from-purple-500 to-pink-600',
            sports:'from-emerald-500 to-teal-600', workshop:'from-orange-400 to-orange-600',
            hackathon:'from-red-500 to-red-700', seminar:'from-slate-600 to-slate-800',
            placement:'from-green-600 to-emerald-700', other:'from-primary-500 to-primary-700'
          }[event.category] || 'from-primary-500 to-primary-700'} mb-6 flex items-center justify-center`}>
        {event.banner
          ? <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
          : <span className="text-7xl">{meta.emoji}</span>
        }
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="badge bg-white/20 text-white backdrop-blur-sm">{meta.label}</span>
          {event.eventType === 'external' && <span className="badge bg-white/20 text-white backdrop-blur-sm">🌍 External</span>}
          {event.isOnline && <span className="badge bg-white/20 text-white backdrop-blur-sm">🌐 Online</span>}
          {past && <span className="badge bg-black/40 text-white">Completed</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{event.title}</h1>
            {event.club && <p className="text-sm text-slate-500 mb-4">Organized by {event.club}</p>}
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>

            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map(t => (
                  <span key={t} className="badge-gray">#{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Eligibility info */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-3">📋 Eligibility</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex gap-2">
                <span className="text-slate-400">Departments:</span>
                <span className="font-medium">
                  {event.eligibility.allDepartments ? 'All departments' : event.eligibility.departments.join(', ')}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400">Years:</span>
                <span className="font-medium">
                  {event.eligibility.allYears ? 'All years' : `Year ${event.eligibility.years.join(', ')}`}
                </span>
              </div>
              {event.eligibility.maxParticipants > 0 && (
                <div className="flex gap-2">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="font-medium">{event.registrationCount} / {event.eligibility.maxParticipants} registered</span>
                </div>
              )}
              {event.eligibility.teamEvent && (
                <div className="flex gap-2">
                  <span className="text-slate-400">Team size:</span>
                  <span className="font-medium">{event.eligibility.teamSize} members</span>
                </div>
              )}
            </div>

            {/* Eligibility status for students */}
            {isStudent && data.isEligible !== undefined && (
              <div className={`mt-4 p-3 rounded-xl text-sm ${data.isEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {data.isEligible
                  ? '✅ You are eligible for this event'
                  : <>⚠️ You don't meet the eligibility criteria: {data.eligibilityReasons?.join(', ')}. You can still request to attend.</>
                }
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Event info card */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-slate-900">Event Details</h3>
            {[
              { icon: '📅', label: 'Date', val: formatDateTime(event.date) },
              { icon: event.isOnline ? '🌐' : '📍', label: event.isOnline ? 'Platform' : 'Venue', val: event.isOnline ? 'Online' : (event.location || 'TBA') },
              { icon: '🏆', label: 'Points', val: `+${event.pointsForAttending} pts for attending` },
              { icon: '👤', label: 'Registrations', val: `${event.registrationCount} registered` },
            ].map(({ icon, label, val }) => (
              <div key={label} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">{icon}</span>
                <div>
                  <p className="text-slate-400 text-xs">{label}</p>
                  <p className="text-slate-800 font-medium">{val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Coordinator */}
          {event.createdBy && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Coordinator</h3>
              <div className="flex items-center gap-3">
                <Avatar name={event.createdBy.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{event.createdBy.name}</p>
                  <p className="text-xs text-slate-400">{event.createdBy.department}</p>
                </div>
              </div>
            </div>
          )}

          {/* Registration action */}
          {isStudent && !past && (
            <div className="card p-5 space-y-3">
              {registration ? (
                <>
                  {registration.overrideStatus === 'pending' && (
                    <Alert type="warning">Your attendance request is pending coordinator approval.</Alert>
                  )}
                  {registration.overrideStatus === 'rejected' && (
                    <Alert type="error">Your request was rejected: {registration.overrideRejectionNote}</Alert>
                  )}
                  {(registration.isEligible || registration.overrideStatus === 'approved') && (
                    <Alert type="success">You're registered! {event.isOnline && event.meetLink &&
                      <><br/><a href={event.meetLink} target="_blank" rel="noreferrer" className="underline">Join link →</a></>}</Alert>
                  )}
                  <button onClick={handleCancel} className="btn-danger w-full text-sm">
                    Cancel Registration
                  </button>
                </>
              ) : (
                <>
                  {!data.isEligible && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
                      ⚠️ You're not in the eligible group, but you can request access from the coordinator.
                    </p>
                  )}
                  <button
                    onClick={() => data.isEligible ? handleRegister() : setAttendAnywayModal(true)}
                    className={`w-full ${data.isEligible ? 'btn-primary' : 'btn-secondary border-amber-300 text-amber-700 hover:bg-amber-50'}`}
                    disabled={registering}
                  >
                    {registering ? <Spinner size="sm" /> : data.isEligible ? '🎫 Register Now' : '🙋 Request Access'}
                  </button>
                </>
              )}
            </div>
          )}

          {event.externalLink && (
            <a href={event.externalLink} target="_blank" rel="noreferrer" className="btn-secondary w-full text-sm">
              🔗 External Registration Page
            </a>
          )}
        </div>
      </div>

      {/* Attend Anyway Modal */}
      <Modal isOpen={attendAnywayModal} onClose={() => setAttendAnywayModal(false)} title="Request Event Access">
        <div className="space-y-4">
          <Alert type="warning">
            You don't meet the standard eligibility criteria for this event. You can still request access by explaining why you'd like to attend.
          </Alert>
          <div>
            <label className="label">Why do you want to attend this event?</label>
            <textarea
              className="textarea h-28"
              placeholder="Explain your interest and why you'd benefit from attending…"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAttendAnywayModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={() => handleRegister(true)}
              className="btn-primary flex-1"
              disabled={!reason.trim() || registering}
            >
              {registering ? <Spinner size="sm" /> : 'Send Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
