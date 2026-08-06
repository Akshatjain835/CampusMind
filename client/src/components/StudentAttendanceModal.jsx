import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, AlertTriangle, CheckCircle2, Calculator, BookOpen, Sparkles } from 'lucide-react';

const SUBJECT_ATTENDANCE_DATA = {
  'Computer Science & Engineering': [
    { code: 'CS601', name: 'Compiler Design', faculty: 'Dr. R. K. Sharma', attended: 22, total: 25, pct: 88, status: 'Safe' },
    { code: 'CS602', name: 'Computer Networks', faculty: 'Prof. Anita Roy', attended: 23, total: 28, pct: 82.1, status: 'Safe' },
    { code: 'CS603', name: 'Artificial Intelligence', faculty: 'Dr. V. Patel', attended: 21, total: 24, pct: 87.5, status: 'Safe' },
    { code: 'CS604', name: 'AI & Data Science Lab', faculty: 'Dr. V. Patel', attended: 18, total: 20, pct: 90, status: 'Excellent' },
    { code: 'CS605', name: 'Networks & Security Lab', faculty: 'Prof. Anita Roy', attended: 16, total: 20, pct: 80, status: 'Safe' },
    { code: 'CS606', name: 'Mini Project & Seminar', faculty: 'Dr. R. K. Sharma', attended: 11, total: 15, pct: 73.3, status: 'Warning' }
  ],
  'Electronics & Communication Engineering': [
    { code: 'EC601', name: 'Analog & Digital Signal Processing', faculty: 'Dr. A. Verma', attended: 24, total: 28, pct: 85.7, status: 'Safe' },
    { code: 'EC602', name: 'VLSI System Design', faculty: 'Prof. S. Gupta', attended: 22, total: 25, pct: 88, status: 'Safe' },
    { code: 'EC603', name: 'Wireless Communication', faculty: 'Dr. M. Rao', attended: 19, total: 24, pct: 79.1, status: 'Safe' },
    { code: 'EC604', name: 'VLSI Design Lab', faculty: 'Prof. S. Gupta', attended: 18, total: 20, pct: 90, status: 'Excellent' },
    { code: 'EC605', name: 'Microwave & Antenna Lab', faculty: 'Dr. M. Rao', attended: 15, total: 18, pct: 83.3, status: 'Safe' }
  ]
};

export const StudentAttendanceModal = ({ isOpen, onClose, user }) => {
  const department = user?.department || 'Computer Science & Engineering';
  const subjects = SUBJECT_ATTENDANCE_DATA[department] || SUBJECT_ATTENDANCE_DATA['Computer Science & Engineering'];

  // Calculate actual total attended and total classes
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalClasses = subjects.reduce((sum, s) => sum + s.total, 0);
  const basePct = ((totalAttended / totalClasses) * 100).toFixed(1);

  // Predictor state
  const [upcomingAttended, setUpcomingAttended] = useState(5);
  const [upcomingMissed, setUpcomingMissed] = useState(0);

  if (!isOpen) return null;

  // Compute predicted percentage
  const newAttended = totalAttended + parseInt(upcomingAttended || 0);
  const newTotal = totalClasses + parseInt(upcomingAttended || 0) + parseInt(upcomingMissed || 0);
  const predictedPct = newTotal > 0 ? ((newAttended / newTotal) * 100).toFixed(1) : basePct;

  const isEligible = predictedPct >= 75;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-scale-in" style={{
        maxWidth: '780px',
        width: '100%',
        maxHeight: '88vh',
        overflowY: 'auto',
        padding: '30px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(52, 211, 153, 0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.3)'
            }}>
              <TrendingUp size={24} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Student Attendance Analytics & AI Predictor</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {user?.name || 'Student'} • {user?.rollNumber || 'CS2024-042'} ({user?.department})
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Current Attendance Summary Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Current Overall Attendance
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#34d399', lineHeight: 1.1, marginTop: '4px' }}>
              {basePct}%
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Attended {totalAttended} of {totalClasses} Total Conducted Lectures
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '20px',
              background: basePct >= 75 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              border: `1px solid ${basePct >= 75 ? '#34d399' : '#f43f5e'}`,
              color: basePct >= 75 ? '#34d399' : '#f43f5e',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {basePct >= 75 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {basePct >= 75 ? 'Eligible for End-Sem Exam' : 'Shortage - Condensation Needed'}
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Regulation Threshold: <strong>75.0% Minimum</strong>
            </div>
          </div>
        </div>

        {/* Subject-Wise Attendance Breakdown */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px', color: '#e5e7eb' }}>
            Subject-Wise Attendance Breakdown
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subjects.map((sub) => (
              <div key={sub.code} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '10px',
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#38bdf8' }}>{sub.code}: {sub.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      👨‍🏫 {sub.faculty} • {sub.attended}/{sub.total} Classes Attended
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: sub.pct >= 75 ? '#34d399' : '#fbbf24' }}>
                      {sub.pct}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${sub.pct}%`,
                    height: '100%',
                    background: sub.pct >= 85 ? 'linear-gradient(90deg, #34d399, #38bdf8)' : sub.pct >= 75 ? '#34d399' : '#fbbf24',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Attendance Predictor Calculator */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '14px',
          padding: '20px',
          marginTop: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Calculator size={18} color="#818cf8" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#a5b4fc', margin: 0 }}>
              AI Attendance Predictor Calculator
            </h4>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Simulate attending or missing upcoming lectures to predict your future exam eligibility status:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Upcoming Classes You Plan to Attend:
              </label>
              <input 
                type="number"
                min="0"
                max="30"
                value={upcomingAttended}
                onChange={(e) => setUpcomingAttended(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Upcoming Classes You Might Miss:
              </label>
              <input 
                type="number"
                min="0"
                max="30"
                value={upcomingMissed}
                onChange={(e) => setUpcomingMissed(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Prediction Result Badge */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            border: `1px solid ${isEligible ? 'rgba(52, 211, 153, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Predicted Final Attendance:</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isEligible ? '#34d399' : '#f43f5e' }}>
                {predictedPct}%
              </div>
            </div>

            <span style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: isEligible ? '#34d399' : '#f43f5e',
              background: isEligible ? 'rgba(52, 211, 153, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              padding: '6px 14px',
              borderRadius: '20px'
            }}>
              {isEligible ? '✅ Safe (Above 75%)' : '⚠️ Shortage Warning (<75%)'}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
