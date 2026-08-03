import React, { useState } from 'react';
import { Sparkles, Calendar, CheckCircle2, AlertCircle, X, Send, Cpu } from 'lucide-react';

export const TimetableGeneratorModal = ({ isOpen, onClose, onTimetableSaved }) => {
  const [semester, setSemester] = useState('6th Semester');
  const [section, setSection] = useState('Section A');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/timetable/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          semester,
          section,
          courses: [
            { code: 'CS601', name: 'Compiler Design', faculty: 'Dr. R. K. Sharma', type: 'Lecture' },
            { code: 'CS602', name: 'Computer Networks', faculty: 'Prof. Anita Roy', type: 'Lecture' },
            { code: 'CS603', name: 'Artificial Intelligence', faculty: 'Dr. V. Patel', type: 'Lecture' },
            { code: 'CS604', name: 'AI & Data Lab', faculty: 'Dr. V. Patel', type: 'Lab', room: 'AI Lab 101' },
            { code: 'CS605', name: 'Networks Lab', faculty: 'Prof. Anita Roy', type: 'Lab', room: 'Net Lab 102' }
          ],
          labRooms: ['AI Lab 101', 'Net Lab 102', 'LH-201', 'LH-202']
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
      } else {
        setErrorMsg(data.message || 'Failed to generate AI timetable.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to Python AI Scheduling Microservice.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishTimetable = async () => {
    if (!aiResult || !aiResult.slots) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          semester: aiResult.semester,
          section: aiResult.section,
          academicYear: aiResult.academicYear || '2025-2026',
          slots: aiResult.slots
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setAiResult(null);
          onTimetableSaved();
          onClose();
        }, 1200);
      } else {
        const data = await res.json();
        setErrorMsg(data.message || 'Failed to save timetable');
      }
    } catch (err) {
      setErrorMsg('Failed to save timetable to MongoDB.');
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
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={24} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>AI Conflict-Free Timetable Generator</h3>
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

        {saveSuccess && (
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
            <span>Timetable Schedule Published Successfully to Department Matrix!</span>
          </div>
        )}

        {/* Controls Form */}
        <form onSubmit={handleGenerateAi} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Target Semester</label>
              <select 
                className="form-select"
                value={semester} 
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="6th Semester">6th Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="8th Semester">8th Semester</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Section</label>
              <select 
                className="form-select"
                value={section} 
                onChange={(e) => setSection(e.target.value)}
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}>
            🤖 <strong>AI CSP Constraints Applied:</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '6px', lineHeight: 1.5 }}>
              <li>Zero Faculty Double-Booking Across Classrooms</li>
              <li>Lab Room Collisions Prevention (Continuous 2-Hour Practical Slots)</li>
              <li>Balanced Lecture Load Distribution (Mon–Fri)</li>
            </ul>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={18} />
            {loading ? 'AI Python Agent Solving CSP Constraints...' : 'Generate Conflict-Free Schedule'}
          </button>
        </form>

        {/* AI Result Preview */}
        {aiResult && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#34d399" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>
                  {aiResult.conflictStatus || 'Zero Conflicts Detected'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 600 }}>
                {aiResult.totalSlots || aiResult.slots?.length} Slots Allocated
              </span>
            </div>

            {/* Slots Preview Grid */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '10px',
              padding: '14px',
              maxHeight: '220px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {aiResult.slots?.map((slot, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <strong style={{ color: slot.type === 'Lab' ? '#c084fc' : '#38bdf8' }}>{slot.day} ({slot.timeSlot})</strong>
                    <div style={{ color: '#e5e7eb', marginTop: '2px' }}>{slot.courseCode}: {slot.courseName}</div>
                  </div>
                  <div style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                    <div>👨‍🏫 {slot.facultyName}</div>
                    <div style={{ fontWeight: 600, color: '#fbbf24' }}>🏫 {slot.room}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setAiResult(null)} className="btn btn-secondary">
                Discard
              </button>
              <button onClick={handlePublishTimetable} className="btn btn-primary" disabled={loading}>
                <Send size={16} /> Publish Timetable to MongoDB
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
