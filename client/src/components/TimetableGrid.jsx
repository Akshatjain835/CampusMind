import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TimetableGeneratorModal } from './TimetableGeneratorModal';
import { 
  Calendar, Clock, Sparkles, Plus, BookOpen, 
  Trash2, RefreshCw, Layers, MapPin, CheckCircle2 
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TimetableGrid = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState('6th Semester');
  const [section, setSection] = useState('Section A');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/timetable?semester=${encodeURIComponent(semester)}&section=${encodeURIComponent(section)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTimetable(data);
    } catch (err) {
      console.error('Failed to fetch timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [semester, section]);

  const handleClearSchedule = async () => {
    if (!window.confirm('Are you sure you want to clear this active timetable schedule?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/timetable?semester=${encodeURIComponent(semester)}&section=${encodeURIComponent(section)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchTimetable();
    } catch (err) {
      console.error('Failed to clear timetable:', err);
    }
  };

  const getSlotPillStyle = (type) => {
    switch (type) {
      case 'Lab':
        return { bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.3)', color: '#c084fc' };
      case 'Tutorial':
        return { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' };
      default:
        return { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8' };
    }
  };

  const slots = timetable?.slots || [];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px', marginBottom: '32px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Calendar size={22} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Weekly Academic Timetable & Lab Allocation</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            AI-Optimized schedules for <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{user?.department || 'Computer Science & Engineering'}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {(user?.role === 'hod' || user?.role === 'admin' || user?.role === 'faculty') && (
            <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} /> Generate AI Timetable
            </button>
          )}
        </div>
      </div>

      {/* Selectors Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            className="form-select" 
            style={{ width: '160px' }}
            value={semester} 
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="6th Semester">6th Semester</option>
            <option value="4th Semester">4th Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="8th Semester">8th Semester</option>
          </select>

          <select 
            className="form-select" 
            style={{ width: '140px' }}
            value={section} 
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="Section A">Section A</option>
            <option value="Section B">Section B</option>
            <option value="Section C">Section C</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Total Slots: <strong>{slots.length}</strong>
          </span>

          {(user?.role === 'admin' || user?.role === 'hod') && slots.length > 0 && (
            <button onClick={handleClearSchedule} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f43f5e' }}>
              <Trash2 size={14} /> Clear Schedule
            </button>
          )}
        </div>
      </div>

      {/* Grid Table Rendering */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading interactive timetable grid...
        </div>
      ) : slots.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No active timetable schedule found for {semester} ({section}). HOD can click <strong>Generate AI Timetable</strong> to create a conflict-free schedule!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {DAYS.map((day) => {
            const daySlots = slots.filter(s => s.day === day);

            return (
              <div 
                key={day} 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  borderRadius: '12px', 
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-purple)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px' }}>
                  {day}
                </div>

                {daySlots.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '12px 0' }}>
                    No classes scheduled
                  </div>
                ) : (
                  daySlots.map((slot, idx) => {
                    const style = getSlotPillStyle(slot.type);

                    return (
                      <div 
                        key={idx} 
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: style.color }}>
                            {slot.type?.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {slot.timeSlot}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                          {slot.courseCode}: {slot.courseName}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#e5e7eb', marginTop: '2px' }}>
                          👨‍🏫 {slot.facultyName}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
                          🏫 {slot.room}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Timetable Generator Modal */}
      <TimetableGeneratorModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onTimetableSaved={fetchTimetable} 
      />

    </div>
  );
};
