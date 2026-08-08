import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

export const AttendancePage = () => {
  const [courses, setCourses] = useState([
    { code: 'CS601', name: 'Compiler Design', attended: 38, total: 42, percentage: 90.5, risk: 'LOW RISK', maxAbsencesAllowed: 4 },
    { code: 'CS602', name: 'Computer Networks', attended: 27, total: 36, percentage: 75.0, risk: 'MEDIUM RISK', maxAbsencesAllowed: 0 },
    { code: 'CS603', name: 'AI & Machine Learning', attended: 35, total: 40, percentage: 87.5, risk: 'LOW RISK', maxAbsencesAllowed: 3 },
    { code: 'CS604', name: 'Database Management Systems', attended: 39, total: 42, percentage: 92.8, risk: 'LOW RISK', maxAbsencesAllowed: 5 },
    { code: 'CS605', name: 'Operating Systems Lab', attended: 24, total: 30, percentage: 80.0, risk: 'LOW RISK', maxAbsencesAllowed: 1 }
  ]);
  const [overallPct, setOverallPct] = useState(85.1);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/analytics/kpi', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.kpis?.overallAttendanceRate) {
            setOverallPct(data.kpis.overallAttendanceRate);
          }
        }
      } catch (err) {
        console.error('Failed to fetch attendance KPIs:', err);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Metric Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: '8px' }}>
            Overall Semester Attendance
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
            {overallPct}%
          </div>
          <div style={{
            height: '8px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${Math.min(100, overallPct)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 100%)'
            }} />
          </div>
          <div style={{ fontSize: '0.78rem', color: overallPct >= 75 ? '#34d399' : '#f43f5e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> {overallPct >= 75 ? 'Mandatory 75% Threshold Met' : 'Below Mandatory 75% Threshold'}
          </div>
        </div>

        {/* AI Predictive Risk Card */}
        <div className="glass-card" style={{ padding: '24px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={18} color="#818cf8" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase' }}>
              AI Attendance Forecast
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
            Overall computed semester attendance is <strong>{overallPct}%</strong>. Maintain current attendance to ensure exam hall ticket eligibility under Clause 1.1.
          </p>
        </div>
      </div>

      {/* Course-Wise Attendance Breakdown */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="#38bdf8" /> Course-Wise Attendance & Risk Breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {courses.map((course, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                    {course.code}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2px 0 0 0' }}>{course.name}</h4>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: course.risk === 'LOW RISK' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                    color: course.risk === 'LOW RISK' ? '#34d399' : '#facc15',
                    border: course.risk === 'LOW RISK' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)'
                  }}>
                    {course.risk}
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>{course.percentage}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  width: `${course.percentage}%`,
                  height: '100%',
                  background: course.percentage >= 85 ? '#34d399' : course.percentage >= 75 ? '#facc15' : '#f43f5e'
                }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>Attended: <strong>{course.attended} / {course.total}</strong> classes</span>
                <span>AI Recommendation: <strong style={{ color: course.maxAbsencesAllowed > 0 ? '#38bdf8' : '#f43f5e' }}>
                  {course.maxAbsencesAllowed > 0 ? `Can miss up to ${course.maxAbsencesAllowed} more classes` : 'Must attend next 4 classes'}
                </strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

