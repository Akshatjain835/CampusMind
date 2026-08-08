import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, BookOpen, Mail, Award, CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>User Profile & Settings</h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Personal academic credentials and role permissions</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>{user?.name || 'Academic User'}</h3>
            <div style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
              {user?.role || 'Student'} • {user?.department || 'Computer Science & Engineering'}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Student Roll Number / ID</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{user?.rollNumber || user?.studentId || 'STU1024'}</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Semester & Section</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{user?.semester || '6th Semester'} - {user?.section || 'Section A'}</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Registered Email</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{user?.email || 'student@campusmind.edu'}</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Academic Standing</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Good Standing (Active)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
