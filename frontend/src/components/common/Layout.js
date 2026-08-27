import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common';
import { getPointsTier } from '../../utils/helpers';

const STUDENT_NAV = [
  { to: '/dashboard',   icon: '🏠', label: 'Dashboard'   },
  { to: '/events',      icon: '📅', label: 'Events'       },
  { to: '/my-events',   icon: '🎫', label: 'My Events'    },
  { to: '/coding',      icon: '💻', label: 'Coding Stats' },
  { to: '/leaderboard', icon: '🏆', label: 'Leaderboard'  },
  { to: '/profile',     icon: '👤', label: 'My Profile'   },
  { to: '/resume',      icon: '📄', label: 'Resume'       },
];

const TEACHER_NAV = [
  { to: '/teacher',              icon: '📊', label: 'Dashboard'    },
  { to: '/events',               icon: '📅', label: 'Events'        },
  { to: '/events/create',        icon: '➕', label: 'Create Event'  },
  { to: '/teacher/students',     icon: '👥', label: 'Students'      },
  { to: '/teacher/overrides',    icon: '⚠️', label: 'Requests'     },
  { to: '/leaderboard',          icon: '🏆', label: 'Leaderboard'   },
];

const ADMIN_NAV = [
  ...TEACHER_NAV,
  { to: '/admin', icon: '⚙️', label: 'Admin Panel' },
];

export const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout, isStudent, isAdmin } = useAuth();
  const tier = getPointsTier(user?.points || 0);
  const nav = isAdmin ? ADMIN_NAV : isStudent ? STUDENT_NAV : TEACHER_NAV;

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40
      flex flex-col transition-all duration-300 shadow-sm
      ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          4U
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-slate-900 text-sm">4U App</span>
            <p className="text-[10px] text-slate-400">Engineering College</p>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin space-y-1">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard' || item.to === '/teacher'}
            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item-inactive'}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      {user && (
        <div className={`border-t border-slate-100 p-3 ${collapsed ? '' : 'space-y-3'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                <p className={`text-[10px] font-medium ${tier.color}`}>{tier.icon} {tier.label} · {user.points} pts</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`w-full nav-item-inactive justify-center ${collapsed ? 'px-2' : ''}`}
          >
            <span className="text-base">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
};

// ── Main app layout ───────────────────────────────────────────────────────────
export const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? '4rem' : '16rem' }}
      >
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};
