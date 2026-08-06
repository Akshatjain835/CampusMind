import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, Bell, LogOut, User, Shield, 
  ChevronDown, CheckCircle2, Clock, Calendar 
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Department Meeting Scheduled', time: '10 mins ago', type: 'meeting' },
    { id: 2, title: 'Leave Application Status Updated', time: '1 hour ago', type: 'leave' },
    { id: 3, title: 'NAAC Criteria 1 Audit Complete', time: 'Yesterday', type: 'audit' }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return '#38bdf8';
      case 'faculty': return '#34d399';
      case 'hod': return '#fbbf24';
      case 'admin': return '#f43f5e';
      default: return '#818cf8';
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      background: 'rgba(15, 23, 42, 0.75)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, lineHeight: 1 }}>
              CampusMind <span className="gradient-text">AI</span>
            </h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {user?.department || 'Computer Science & Engineering'}
            </span>
          </div>
        </div>

        {/* Right User Bar & Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px',
                borderRadius: '10px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f43f5e'
              }} />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '300px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(16px)',
                zIndex: 110
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Live System Alerts</span>
                  <span style={{ fontSize: '0.7rem', color: '#34d399' }}>● Active</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ fontWeight: 600, color: '#e5e7eb' }}>{n.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '6px 12px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: `rgba(99, 102, 241, 0.2)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${getRoleColor(user?.role)}`
            }}>
              <User size={16} color={getRoleColor(user?.role)} />
            </div>

            <div style={{ fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{user?.name || 'User'}</div>
              <span style={{
                fontSize: '0.7rem',
                color: getRoleColor(user?.role),
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {user?.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f43f5e',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
