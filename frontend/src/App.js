import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/common/Layout';

// ── Pages ─────────────────────────────────────────────────────────────────────
import { LoginPage, RegisterPage }    from './pages/AuthPages';
import { StudentDashboard }           from './pages/StudentDashboard';
import { TeacherDashboard }           from './pages/TeacherDashboard';
import { EventsPage }                 from './pages/EventsPage';
import { EventDetailPage }            from './pages/EventDetailPage';
import { CreateEventPage }            from './pages/CreateEventPage';
import { MyEventsPage }               from './pages/MyEventsPage';
import { CodingPage }                 from './pages/CodingPage';
import { LeaderboardPage }            from './pages/LeaderboardPage';
import { ProfilePage }                from './pages/ProfilePage';
import { ResumePage }                 from './pages/ResumePage';
import { StudentsPage }               from './pages/StudentsPage';
import { OverridesPage }              from './pages/OverridesPage';
import { StudentProfilePage }         from './pages/StudentProfilePage';
import { PageSpinner }                from './components/common';

// ── Route Guards ──────────────────────────────────────────────────────────────
/**
 * PrivateRoute — wraps a page with Layout and enforces:
 *   1. User must be logged in
 *   2. User must have an allowed role (if roles prop provided)
 */
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><PageSpinner /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate home
    return <Navigate to={user.role === 'student' ? '/dashboard' : '/teacher'} replace />;
  }

  return <Layout>{children}</Layout>;
};

/** Redirect logged-in users away from auth pages */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'student' ? '/dashboard' : '/teacher'} replace />;
  return children;
};

// ── App Routes ────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={
        <Navigate to={user ? (user.role === 'student' ? '/dashboard' : '/teacher') : '/login'} replace />
      } />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Student routes */}
      <Route path="/dashboard" element={
        <PrivateRoute roles={['student']}>
          <StudentDashboard />
        </PrivateRoute>
      } />
      <Route path="/my-events" element={
        <PrivateRoute roles={['student']}>
          <MyEventsPage />
        </PrivateRoute>
      } />
      <Route path="/coding" element={
        <PrivateRoute roles={['student']}>
          <CodingPage />
        </PrivateRoute>
      } />
      <Route path="/resume" element={
        <PrivateRoute roles={['student']}>
          <ResumePage />
        </PrivateRoute>
      } />

      {/* Teacher routes */}
      <Route path="/teacher" element={
        <PrivateRoute roles={['teacher', 'admin']}>
          <TeacherDashboard />
        </PrivateRoute>
      } />
      <Route path="/teacher/students" element={
        <PrivateRoute roles={['teacher', 'admin']}>
          <StudentsPage />
        </PrivateRoute>
      } />
      <Route path="/teacher/overrides" element={
        <PrivateRoute roles={['teacher', 'admin']}>
          <OverridesPage />
        </PrivateRoute>
      } />

      {/* Shared routes (all roles) */}
      <Route path="/events" element={
        <PrivateRoute>
          <EventsPage />
        </PrivateRoute>
      } />
      <Route path="/events/create" element={
        <PrivateRoute roles={['teacher', 'admin']}>
          <CreateEventPage />
        </PrivateRoute>
      } />
      <Route path="/events/:id/edit" element={
        <PrivateRoute roles={['teacher', 'admin']}>
          <CreateEventPage />
        </PrivateRoute>
      } />
      <Route path="/events/:id" element={
        <PrivateRoute>
          <EventDetailPage />
        </PrivateRoute>
      } />
      <Route path="/leaderboard" element={
        <PrivateRoute>
          <LeaderboardPage />
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <ProfilePage />
        </PrivateRoute>
      } />
      <Route path="/users/:id/profile" element={
        <PrivateRoute>
          <StudentProfilePage />
        </PrivateRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <PrivateRoute>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Page not found</h2>
            <p className="text-slate-400 mb-4">The page you're looking for doesn't exist.</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        </PrivateRoute>
      } />
    </Routes>
  );
};

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f8fafc' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
