import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { 
  Calendar, Clock, MapPin, Sparkles, Plus, 
  Trash2, RefreshCw, Users, FileText, CheckCircle2, XCircle 
} from 'lucide-react';

export const MeetingScheduler = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/meetings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMeetings(data);
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCancelMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchMeetings();
    } catch (err) {
      console.error('Failed to cancel meeting:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(52, 211, 153, 0.3)' }}>SCHEDULED</span>;
      case 'Rescheduled':
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(251, 191, 36, 0.3)' }}>RESCHEDULED</span>;
      case 'Cancelled':
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(244, 63, 94, 0.3)' }}>CANCELLED</span>;
      default:
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700 }}>COMPLETED</span>;
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px', marginBottom: '32px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Calendar size={22} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>LangGraph AI Meeting Scheduler & Reminders</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Automated conflict resolution & room allocation for <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{user?.department || 'Computer Science & Engineering'}</span>
          </p>
        </div>

        {(user?.role === 'hod' || user?.role === 'admin' || user?.role === 'faculty') && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} /> Schedule AI Meeting
          </button>
        )}
      </div>

      {/* Meetings List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading scheduled department meetings...
        </div>
      ) : meetings.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No upcoming meetings scheduled. Click <strong>Schedule AI Meeting</strong> to run the LangGraph Scheduler Agent!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {meetings.map((meeting) => {
            const isExpanded = expandedMeetingId === meeting._id;

            return (
              <div 
                key={meeting._id} 
                className="glass-card animate-fade-in" 
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{meeting.title}</h4>
                      {getStatusBadge(meeting.status)}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-dim)', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span>📅 Date: <strong>{new Date(meeting.meetingDate).toLocaleDateString()}</strong></span>
                      <span>⏰ Time: <strong>{meeting.timeSlot}</strong></span>
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>🏫 Venue: <strong>{meeting.room}</strong></span>
                      <span>👔 Organizer: {meeting.organizerName || 'HOD'}</span>
                    </div>
                  </div>

                  {(user?.role === 'admin' || user?.role === 'hod' || meeting.organizer === user?._id) && meeting.status !== 'Cancelled' && (
                    <button 
                      onClick={() => handleCancelMeeting(meeting._id)} 
                      style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                      title="Cancel Meeting"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Agenda Box */}
                {meeting.agenda && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.85rem',
                    color: '#e5e7eb',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace'
                  }}>
                    📌 <strong>AI Generated Agenda & Objectives:</strong>\n{meeting.agenda}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onMeetingScheduled={fetchMeetings} 
      />

    </div>
  );
};
