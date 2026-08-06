import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentProfileModal } from './StudentProfileModal';
import {
  Sparkles, Bell, LogOut, User, Shield,
  ChevronDown, CheckCircle2, Clock, Calendar, FileText, CheckCheck, Settings
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);

        // Detect new unread notification alert
        const currentUnread = data.filter(n => !n.isRead);
        if (currentUnread.length > prevUnreadCount && currentUnread.length > 0) {
          const newest = currentUnread[0];
          setActiveToast(newest);

          // Play subtle web audio notification chime
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          } catch (audioErr) {
            // Audio context fallback
          }

          // Auto hide toast after 6 seconds
          setTimeout(() => {
            setActiveToast(null);
          }, 6000);
        }
        setPrevUnreadCount(currentUnread.length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);
    return () => clearInterval(interval);
  }, [prevUnreadCount]);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return <Calendar size={14} color="#38bdf8" />;
      case 'notice': return <FileText size={14} color="#c084fc" />;
      case 'timetable': return <Clock size={14} color="#fbbf24" />;
      case 'leave': return <CheckCircle2 size={14} color="#34d399" />;
      default: return <Bell size={14} color="#818cf8" />;
    }
  };

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
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '10px',
                  background: '#f43f5e',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '320px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(16px)',
                zIndex: 110
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Live System Alerts ({notifications.length})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#34d399',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} style={{
                        background: n.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.1)',
                        borderLeft: `3px solid ${n.isRead ? 'transparent' : '#6366f1'}`,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          {getTypeIcon(n.type)}
                          <div style={{ fontWeight: 700, color: '#e5e7eb', flex: 1 }}>{n.title}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
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
            <div 
              onClick={() => setShowProfileModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
              title="Click to view & update your profile details"
            >
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
                  {user?.role} • Edit ✏️
                </span>
              </div>
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

      {/* Student / User Profile Update Portal Modal */}
      <StudentProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />

      {/* Floating Active Notification Toast Alert Pop-Up */}
      {activeToast && (
        <div 
          className="animate-slide-down"
          onClick={() => {
            setShowNotifications(true);
            setActiveToast(null);
          }}
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9999,
            maxWidth: '380px',
            width: '100%',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.3)',
            borderRadius: '14px',
            padding: '14px 18px',
            backdropFilter: 'blur(16px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}
        >
          <div style={{
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)'
          }}>
            <Bell size={20} color="#818cf8" className="animate-pulse" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🔔 Live System Alert
              </span>
              <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Just Now</span>
            </div>

            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', margin: '0 0 4px 0', lineHeight: 1.2 }}>
              {activeToast.title}
            </h4>

            <p style={{ fontSize: '0.78rem', color: '#d1d5db', margin: 0, lineHeight: 1.3 }}>
              {activeToast.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                Tap to open notifications ➔
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
