import React from 'react';
import { BookOpen, User, Award, CheckCircle } from 'lucide-react';

export const CoursesPage = () => {
  const courses = [
    { code: 'CS601', title: 'Compiler Design', faculty: 'Prof. Rajesh Kumar', credits: 4, type: 'Core Theory', attendance: '90.5%' },
    { code: 'CS602', title: 'Computer Networks', faculty: 'Prof. Mehta', credits: 4, type: 'Core Theory', attendance: '75.0%' },
    { code: 'CS603', title: 'AI & Machine Learning', faculty: 'Dr. Ananya Verma', credits: 4, type: 'Elective', attendance: '87.5%' },
    { code: 'CS604', title: 'Database Management Systems', faculty: 'Dr. Suresh Sharma', credits: 4, type: 'Core Theory', attendance: '92.8%' },
    { code: 'CS605', title: 'Operating Systems Lab', faculty: 'Prof. Vikram Singh', credits: 2, type: 'Practical Lab', attendance: '80.0%' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Enrolled Courses</h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0 0' }}>6th Semester Computer Science & Engineering</p>
        </div>
        <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>
          Total Credits: 18
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {courses.map((c, idx) => (
          <div key={idx} className="glass-card hover-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', padding: '4px 10px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)' }}>
                {c.code}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{c.type}</span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0' }}>{c.title}</h3>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#a855f7" /> {c.faculty}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8' }}>Credits: <strong>{c.credits}</strong></span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>Attendance: {c.attendance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
