import React from 'react';

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className={`${s} border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin ${className}`} />
  );
};

export const PageSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} animate-in max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
    {subtitle && <p className="text-sm text-slate-400 mb-6 max-w-xs">{subtitle}</p>}
    {action}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, sub, color = 'bg-primary-100 text-primary-700', trend }) => (
  <div className="stat-card animate-in">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
    {trend !== undefined && (
      <div className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

// ── Page Header ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    <div>
      <h1 className="section-title">{title}</h1>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar = ({ name, size = 'md', src, className = '' }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['bg-primary-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500'];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];

  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />;
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'gray' }) => {
  const variants = { gray: 'badge-gray', blue: 'badge-blue', green: 'badge-green', orange: 'badge-orange', red: 'badge-red', purple: 'badge-purple' };
  return <span className={variants[variant] || 'badge-gray'}>{children}</span>;
};

// ── Alert ─────────────────────────────────────────────────────────────────────
export const Alert = ({ type = 'info', children }) => {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error:   'bg-red-50 border-red-200 text-red-800',
  };
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles[type]}`}>
      <span>{icons[type]}</span>
      <div>{children}</div>
    </div>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────────────────
export const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-thin">
    {tabs.map(tab => (
      <button
        key={tab.value}
        onClick={() => onChange(tab.value)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150
          ${active === tab.value
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'}`}
      >
        {tab.icon && <span>{tab.icon}</span>}
        {tab.label}
        {tab.count !== undefined && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === tab.value ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-500'}`}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ── Select Filter ─────────────────────────────────────────────────────────────
export const SelectFilter = ({ value, onChange, options, placeholder = 'All', className = '' }) => (
  <select value={value} onChange={e => onChange(e.target.value)} className={`select text-sm ${className}`}>
    <option value="">{placeholder}</option>
    {options.map(opt => (
      <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
    ))}
  </select>
);
