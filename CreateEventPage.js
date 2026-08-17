import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import { PageHeader, Spinner, Alert } from '../components/common';
import { DEPARTMENTS, YEARS } from '../utils/helpers';
import toast from 'react-hot-toast';

const defaultForm = {
  title: '', description: '', shortDescription: '',
  date: '', endDate: '', registrationDeadline: '',
  isOnline: false, location: '', meetLink: '', externalLink: '',
  category: 'technical', eventType: 'internal',
  tags: '',
  eligibility: { allDepartments: true, departments: [], allYears: true, years: [], maxParticipants: 0, teamEvent: false, teamSize: 1 },
  pointsForAttending: 50, pointsForWinning: 150,
  club: '', status: 'published',
};

export const CreateEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    eventsAPI.getOne(id).then(res => {
      const e = res.data.event;
      setForm({ ...defaultForm, ...e, tags: e.tags?.join(', ') || '',
        date: e.date?.slice(0,16) || '', endDate: e.endDate?.slice(0,16) || '',
        registrationDeadline: e.registrationDeadline?.slice(0,16) || '' });
      setFetchLoading(false);
    }).catch(() => { toast.error('Failed to load event'); navigate('/events'); });
  }, [id, isEdit, navigate]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setElig = (k) => (e) => setForm(f => ({ ...f, eligibility: { ...f.eligibility, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } }));

  const toggleDept = (dept) => setForm(f => {
    const depts = f.eligibility.departments.includes(dept)
      ? f.eligibility.departments.filter(d => d !== dept)
      : [...f.eligibility.departments, dept];
    return { ...f, eligibility: { ...f.eligibility, departments: depts } };
  });

  const toggleYear = (yr) => setForm(f => {
    const years = f.eligibility.years.includes(yr)
      ? f.eligibility.years.filter(y => y !== yr)
      : [...f.eligibility.years, yr];
    return { ...f, eligibility: { ...f.eligibility, years } };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (isEdit) {
        await eventsAPI.update(id, payload);
        toast.success('Event updated!');
        navigate(`/events/${id}`);
      } else {
        const res = await eventsAPI.create(payload);
        toast.success('Event created!');
        navigate(`/events/${res.data.event._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const Section = ({ title, children }) => (
    <div className="card p-6 space-y-4">
      <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title={isEdit ? 'Edit Event' : 'Create Event'} subtitle="Fill in the event details below" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Basic Information">
          <div>
            <label className="label">Event Title *</label>
            <input className="input" placeholder="e.g. National Coding Championship 2025" value={form.title} onChange={set('title')} required />
          </div>
          <div>
            <label className="label">Short Description</label>
            <input className="input" placeholder="One-line summary (shown in cards)" value={form.shortDescription} onChange={set('shortDescription')} maxLength={200} />
          </div>
          <div>
            <label className="label">Full Description *</label>
            <textarea className="textarea h-36" placeholder="Detailed description of the event…" value={form.description} onChange={set('description')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="select" value={form.category} onChange={set('category')}>
                {['technical','cultural','sports','workshop','hackathon','seminar','placement','other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select className="select" value={form.eventType} onChange={set('eventType')}>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Organizing Club / Dept.</label>
              <input className="input" placeholder="e.g. ACM Student Chapter" value={form.club} onChange={set('club')} />
            </div>
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input className="input" placeholder="react, nodejs, web" value={form.tags} onChange={set('tags')} />
            </div>
          </div>
        </Section>

        <Section title="Date & Location">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Event Date & Time *</label>
              <input type="datetime-local" className="input" value={form.date} onChange={set('date')} required />
            </div>
            <div>
              <label className="label">End Date (optional)</label>
              <input type="datetime-local" className="input" value={form.endDate} onChange={set('endDate')} />
            </div>
            <div>
              <label className="label">Registration Deadline</label>
              <input type="datetime-local" className="input" value={form.registrationDeadline} onChange={set('registrationDeadline')} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="online" className="w-4 h-4 rounded text-primary-600" checked={form.isOnline} onChange={set('isOnline')} />
            <label htmlFor="online" className="text-sm text-slate-700 cursor-pointer">This is an online event</label>
          </div>
          {form.isOnline
            ? <div><label className="label">Meet / Event Link</label><input className="input" placeholder="https://meet.google.com/..." value={form.meetLink} onChange={set('meetLink')} /></div>
            : <div><label className="label">Physical Location</label><input className="input" placeholder="e.g. Seminar Hall A, Block 2" value={form.location} onChange={set('location')} /></div>
          }
          <div>
            <label className="label">External Registration Link (optional)</label>
            <input className="input" placeholder="https://devfolio.co/..." value={form.externalLink} onChange={set('externalLink')} />
          </div>
        </Section>

        <Section title="Eligibility">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="allDepts" className="w-4 h-4 rounded text-primary-600"
                checked={form.eligibility.allDepartments} onChange={setElig('allDepartments')} />
              <label htmlFor="allDepts" className="text-sm text-slate-700 cursor-pointer">Open to all departments</label>
            </div>
            {!form.eligibility.allDepartments && (
              <div>
                <label className="label">Select eligible departments</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DEPARTMENTS.map(d => (
                    <button key={d} type="button"
                      onClick={() => toggleDept(d)}
                      className={`btn btn-sm ${form.eligibility.departments.includes(d) ? 'btn-primary' : 'btn-secondary'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <input type="checkbox" id="allYears" className="w-4 h-4 rounded text-primary-600"
                checked={form.eligibility.allYears} onChange={setElig('allYears')} />
              <label htmlFor="allYears" className="text-sm text-slate-700 cursor-pointer">Open to all years</label>
            </div>
            {!form.eligibility.allYears && (
              <div>
                <label className="label">Select eligible years</label>
                <div className="flex gap-2 mt-1">
                  {YEARS.map(y => (
                    <button key={y} type="button"
                      onClick={() => toggleYear(y)}
                      className={`btn btn-sm ${form.eligibility.years.includes(y) ? 'btn-primary' : 'btn-secondary'}`}>
                      Year {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Max Participants (0 = unlimited)</label>
                <input type="number" className="input" min="0" value={form.eligibility.maxParticipants}
                  onChange={e => setForm(f => ({ ...f, eligibility: { ...f.eligibility, maxParticipants: +e.target.value } }))} />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Points & Status">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Points for Attending</label>
              <input type="number" className="input" min="0" value={form.pointsForAttending} onChange={set('pointsForAttending')} />
            </div>
            <div>
              <label className="label">Points for Winning</label>
              <input type="number" className="input" min="0" value={form.pointsForWinning} onChange={set('pointsForWinning')} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={set('status')}>
                {['draft','published','ongoing','completed','cancelled'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? <Spinner size="sm" /> : isEdit ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};
