import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, MapPin, Users, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ScheduleMeetingModal = ({ isOpen, onClose, onMeetingScheduled }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('11:00 AM - 12:00 PM');
  const [priority, setPriority] = useState('Normal');

  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAi = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/meetings/schedule-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          date,
          timeSlot,
          priority,
          participants: [
            { name: 'Dr. R. K. Sharma', email: 'sharma@department.ai', role: 'Faculty' },
            { name: 'Prof. Anita Roy', email: 'roy@department.ai', role: 'Faculty' },
            { name: 'Dr. V. Patel', email: 'patel@department.ai', role: 'HOD' }
          ]
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
      } else {
        setErrorMsg(data.message || 'Failed to schedule AI meeting');
      }
    } catch (err) {
      setErrorMsg('Error communicating with LangGraph Meeting Agent microservice.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishMeeting = async () => {
    if (!aiResult) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: aiResult.title,
          meetingDate: aiResult.meetingDate,
          timeSlot: aiResult.recommendedTimeSlot || aiResult.originalTimeSlot,
          room: aiResult.room,
          agenda: aiResult.agenda,
          invitationText: aiResult.invitationText,
          participants: aiResult.participants
        })
      });

      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => {
          setSuccessMsg(false);
          setAiResult(null);
          setTitle('');
          onMeetingScheduled();
          onClose();
        }, 1200);
      } else {
        const data = await res.json();
        setErrorMsg(data.message || 'Failed to save meeting');
      }
    } catch (err) {
      setErrorMsg('Failed to save meeting to MongoDB database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel animate-scale-in" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>LangGraph AI Meeting Scheduler</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fecdd3',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#f43f5e" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: '#34d399',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} color="#34d399" />
            <span>Department Meeting Scheduled & Automated Email Invitations Dispatched to Attending Faculty!</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleGenerateAi} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Meeting Subject / Purpose</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. NBA Accreditation & Mid-Term Exam Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Time Slot</label>
              <select
                className="form-select"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Normal">Normal Priority</option>
              <option value="High">High Priority (Overrides Small Conflicts)</option>
              <option value="Urgent">Urgent Academic Emergency</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !title.trim()}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={18} />
            {loading ? 'LangGraph Agent Checking Availability & Allocating Room...' : 'Run LangGraph Meeting Scheduler Agent'}
          </button>
        </form>

        {/* AI Result Preview */}
        {aiResult && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#34d399" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>
                  {aiResult.conflictDetected ? '⚠️ Conflict Detected -> Rescheduled' : '✓ Optimal Time & Room Allocated'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontWeight: 600 }}>
                {aiResult.recommendedTimeSlot}
              </span>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.85rem',
              color: '#f3f4f6'
            }}>
              <div>📍 <strong>Allocated Room:</strong> <span style={{ color: '#fbbf24', fontWeight: 700 }}>{aiResult.room}</span></div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontFamily: 'monospace', background: 'rgba(0, 0, 0, 0.3)', padding: '10px', borderRadius: '6px' }}>
                📌 <strong>AI Agenda:</strong>\n{aiResult.agenda}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setAiResult(null)} className="btn btn-secondary">
                Discard
              </button>
              <button onClick={handlePublishMeeting} className="btn btn-primary" disabled={loading}>
                <Send size={16} /> Confirm & Send Invitations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
