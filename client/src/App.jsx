import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';

// Page Imports
import { DashboardPage } from './pages/DashboardPage';
import { AISecretaryPage } from './pages/AISecretaryPage';
import { AttendancePage } from './pages/AttendancePage';
import { CoursesPage } from './pages/CoursesPage';
import { TimetablePage } from './pages/TimetablePage';
import { LeaveManagementPage } from './pages/LeaveManagementPage';
import { NoticesPage } from './pages/NoticesPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { RegulationsPage } from './pages/RegulationsPage';
import { AgentTracesPage } from './pages/AgentTracesPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { ProfilePage } from './pages/ProfilePage';
import { FacultyWorkloadPage } from './pages/FacultyWorkloadPage';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// React Glassmorphic Global Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React Error Boundary Caught]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
        }}>
          <div className="glass-panel animate-scale-in" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(244, 63, 94, 0.3)'
            }}>
              <AlertTriangle size={32} color="#f43f5e" />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
              Interface Reload Requested
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              An unexpected display glitch occurred, but your department database records remain completely intact and safe.
            </p>

            <button
              onClick={this.handleReload}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
            >
              <RefreshCw size={16} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Role-based Route Protection Component
const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const userRole = (user?.role || 'student').toLowerCase();

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Protected Layout Guard Component
const ProtectedApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: '#0f172a'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#818cf8',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
          Loading CampusMind AI System...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="ai-secretary" element={<AISecretaryPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="leaves" element={<LeaveManagementPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="regulations" element={<RegulationsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Role-Guarded Feature Routes */}
        <Route path="faculty-workload" element={
          <RoleRoute allowedRoles={['faculty', 'hod', 'admin']}>
            <FacultyWorkloadPage />
          </RoleRoute>
        } />

        <Route path="approvals" element={
          <RoleRoute allowedRoles={['faculty', 'hod', 'admin']}>
            <ApprovalsPage />
          </RoleRoute>
        } />

        <Route path="analytics" element={
          <RoleRoute allowedRoles={['faculty', 'hod', 'admin']}>
            <AnalyticsPage />
          </RoleRoute>
        } />

        <Route path="agent-traces" element={
          <RoleRoute allowedRoles={['hod', 'admin']}>
            <AgentTracesPage />
          </RoleRoute>
        } />

        <Route path="system-health" element={
          <RoleRoute allowedRoles={['admin']}>
            <SystemHealthPage />
          </RoleRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedApp />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
