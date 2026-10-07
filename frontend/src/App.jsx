import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MyTasksPage from './pages/MyTasksPage';
import TeamPage from './pages/TeamPage';
import TranscriptPage from './pages/TranscriptPage';

function ProtectedLayout({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="empty" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading application...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to permitted default route
    if (user.role === 'ADMIN') return <Navigate to="/dashboard" replace />;
    if (user.role === 'MANAGER') return <Navigate to="/projects" replace />;
    return <Navigate to="/my-tasks" replace />;
  }

  return (
    <div className="app">
      <div className="ambient-glow orb-1" />
      <div className="ambient-glow orb-2" />
      <div className="ambient-glow orb-3" />
      <div className="ambient-glow orb-4" />
      <Sidebar />
      <main className="main">
        {children}
      </main>
    </div>
  );
}

function RoleDefaultRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="empty" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/dashboard" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/projects" replace />;
  return <Navigate to="/my-tasks" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleDefaultRedirect />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <DashboardPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedLayout>
                <ProjectsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/projects/:id"
            element={
              <ProtectedLayout>
                <ProjectDetailPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/my-tasks"
            element={
              <ProtectedLayout allowedRoles={['AGENT', 'ADMIN', 'MANAGER']}>
                <MyTasksPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedLayout>
                <TeamPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/transcript"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <TranscriptPage />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
