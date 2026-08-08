import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Activity, Search, Shield, Sparkles } from 'lucide-react';

export const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dynamic Route Titles
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Department Overview & Command Center';
      case '/ai-secretary': return 'Agentic AI Academic Secretary';
      case '/attendance': return 'Attendance & Exam Eligibility';
      case '/courses': return 'Enrolled Academic Courses';
      case '/timetable': return 'Weekly Timetable & Schedule';
      case '/leaves': return 'Student & Faculty Leave Governance';
      case '/faculty-workload': return 'Faculty Workload Governance & AI Balancing';
      case '/notices': return 'Department Circulars & Notices';
      case '/meetings': return 'Department Meetings & Slots';
      case '/analytics': return 'Executive Department Analytics';
      case '/approvals': return 'Human-In-The-Loop (HITL) Approvals';
      case '/regulations': return 'Academic Regulations & RAG Vector Search';
      case '/agent-traces': return 'LangGraph Multi-Agent Execution Traces';
      case '/system-health': return 'CampusMind System Health & Infrastructure';
      case '/profile': return 'User Profile & Settings';
      default: return 'CampusMind AI Governance';
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Role-Based Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: '260px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Top Header Navbar */}
        <header style={{
          height: '70px',
          padding: '0 32px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          {/* Active Page Title & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              {getPageTitle(location.pathname)}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(52, 211, 153, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#34d399'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              System Operational
            </div>
          </div>

          {/* Header Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Quick Agentic System Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              fontSize: '0.8rem',
              color: '#a5b4fc',
              fontWeight: 600
            }}>
              <Sparkles size={15} color="#818cf8" />
              <span>LangGraph Multi-Agent Engine Active</span>
            </div>

            {/* Role Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#f8fafc',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Shield size={14} color="#38bdf8" />
              <span>{user?.role || 'Student'}</span>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
