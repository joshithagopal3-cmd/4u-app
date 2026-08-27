import { format, formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns';

// ── Date helpers ──────────────────────────────────────────────────────────────
export const formatDate = (d) => format(new Date(d), 'MMM d, yyyy');
export const formatDateTime = (d) => format(new Date(d), 'MMM d, yyyy · h:mm a');
export const timeAgo = (d) => formatDistanceToNow(new Date(d), { addSuffix: true });
export const isEventPast = (d) => isPast(new Date(d));
export const isEventSoon = (d) => isWithinInterval(new Date(d), { start: new Date(), end: addDays(new Date(), 3) });

// ── Category metadata ─────────────────────────────────────────────────────────
export const CATEGORY_META = {
  technical:  { label: 'Technical',   color: 'badge-blue',   emoji: '💻' },
  cultural:   { label: 'Cultural',    color: 'badge-purple', emoji: '🎭' },
  sports:     { label: 'Sports',      color: 'badge-green',  emoji: '⚽' },
  workshop:   { label: 'Workshop',    color: 'badge-orange', emoji: '🔧' },
  hackathon:  { label: 'Hackathon',   color: 'badge-red',    emoji: '⚡' },
  seminar:    { label: 'Seminar',     color: 'badge-blue',   emoji: '🎤' },
  placement:  { label: 'Placement',   color: 'badge-green',  emoji: '💼' },
  other:      { label: 'Other',       color: 'badge-gray',   emoji: '📌' },
};

export const getCategoryMeta = (cat) => CATEGORY_META[cat] || CATEGORY_META.other;

// ── Department list ───────────────────────────────────────────────────────────
export const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'CSD', 'OTHER'];
export const YEARS = [1, 2, 3, 4];

// ── Points tier ───────────────────────────────────────────────────────────────
export const getPointsTier = (pts) => {
  if (pts >= 1000) return { label: 'Gold',    color: 'text-yellow-600', bg: 'bg-yellow-50',  icon: '🥇' };
  if (pts >= 500)  return { label: 'Silver',  color: 'text-slate-500',  bg: 'bg-slate-50',   icon: '🥈' };
  if (pts >= 200)  return { label: 'Bronze',  color: 'text-orange-600', bg: 'bg-orange-50',  icon: '🥉' };
  return               { label: 'Rookie',  color: 'text-blue-600',   bg: 'bg-blue-50',    icon: '⭐' };
};

// ── Rank suffix ───────────────────────────────────────────────────────────────
export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ── Truncate text ─────────────────────────────────────────────────────────────
export const truncate = (str, max = 80) => str?.length > max ? str.slice(0, max) + '…' : str;

// ── Error message extractor ───────────────────────────────────────────────────
export const getErrorMsg = (err) => err?.response?.data?.message || err?.message || 'Something went wrong';
