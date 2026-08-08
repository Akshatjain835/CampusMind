import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Bot,
  Calendar,
  BookOpen,
  Clock,
  FileText,
  Bell,
  Users,
  ShieldCheck,
  Search,
  BarChart3,
  GitBranch,
  Activity,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = (user?.role || 'student').toLowerCase();

  // Navigation Links Definition by Role
  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['student', 'faculty', 'hod', 'admin'] },
        { name: 'AI Secretary', path: '/ai-secretary', icon: Bot, badge: 'Agentic', roles: ['student', 'faculty', 'hod', 'admin'] },
        { name: 'System Health', path: '/system-health', icon: Activity, roles: ['student', 'faculty', 'hod', 'admin'] }
      ]
    },
    {
      title: 'ACADEMICS',
      items: [
        { name: 'Attendance', path: '/attendance', icon: Calendar, roles: ['student', 'faculty', 'hod', 'admin'] },
        { name: 'Courses', path: '/courses', icon: BookOpen, roles: ['student', 'faculty', 'hod', 'admin'] },
        { name: 'Timetable', path: '/timetable', icon: Clock, roles: ['student', 'faculty', 'hod', 'admin'] }
      ]
    },
    {
      title: 'GOVERNANCE',
      items: [
        { name: 'Leave Management', path: '/leaves', icon: FileText, roles: ['student', 'faculty', 'hod', 'admin'] },
        { name: 'Approvals (HITL)', path: '/approvals', icon: ShieldCheck, badge: user?.role !== 'student' ? 'Required' : null, roles: ['faculty', 'hod', 'admin'] },
        { name: 'Department Notices', path: '/notices', icon: Bell, roles: ['student', 'faculty', 'hod', 'admin'] },
        { name: 'Meetings', path: '/meetings', icon: Users, roles: ['student', 'faculty', 'hod', 'admin'] },
        { name: 'Regulations (RAG)', path: '/regulations', icon: Search, roles: ['student', 'faculty', 'hod', 'admin'] }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['faculty', 'hod', 'admin'] },
        { name: 'Agent Traces', path: '/agent-traces', icon: GitBranch, badge: 'LangGraph', roles: ['student', 'faculty', 'hod', 'admin'] }
      ]
    }
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      transition: 'all 0.3s ease',
      boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            CampusMind <span style={{ color: '#818cf8', fontSize: '0.85rem' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, fontWeight: 500 }}>
            Academic Governance Engine
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter(item => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx}>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.08em',
                padding: '0 12px 8px 12px'
              }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {visibleItems.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      end={item.path === '/'}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#ffffff' : '#94a3b8',
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%)' 
                          : 'transparent',
                        border: isActive ? '1px solid rgba(129, 140, 248, 0.3)' : '1px solid transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: item.badge === 'Agentic' || item.badge === 'LangGraph' 
                            ? 'rgba(99, 102, 241, 0.2)' 
                            : 'rgba(234, 179, 8, 0.2)',
                          color: item.badge === 'Agentic' || item.badge === 'LangGraph' ? '#818cf8' : '#facc15',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Profile & Logout */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            borderRadius: '10px',
            background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            textDecoration: 'none',
            color: '#f8fafc'
          })}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'capitalize' }}>
              {user?.role || 'student'} • {user?.department || 'CSE'}
            </div>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: '#f43f5e',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );
};
