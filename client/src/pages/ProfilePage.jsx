import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Lock, Mail, Phone, Globe, Github, Linkedin, 
  CheckCircle2, Save, Sparkles, ShieldCheck, AlertCircle, RefreshCw 
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  
  // Non-critical editable fields state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+91 98765 43210',
    bio: user?.bio || 'Passionate about Artificial Intelligence, Distributed Systems, and Web Architecture.',
    githubUrl: user?.githubUrl || 'https://github.com',
    linkedinUrl: user?.linkedinUrl || 'https://linkedin.com'
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl
      });
      setSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '900px' }}>
      
      {/* Top Banner Overview */}
      <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 0 35px rgba(99, 102, 241, 0.45)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                {user?.name || 'Academic User'}
              </h3>
              <span className={`badge-role badge-${user?.role || 'student'}`}>
                {user?.role?.toUpperCase() || 'STUDENT'}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#818cf8', fontWeight: 600 }}>
              {user?.department || 'Computer Science & Engineering'} • {user?.rollNumber || user?.studentId || 'STU1024'}
            </div>
          </div>

          <div style={{
            padding: '8px 16px',
            borderRadius: '20px',
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: '#34d399',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={16} /> Active Academic Standing
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div style={{
          background: 'rgba(52, 211, 153, 0.15)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          color: '#6ee7b7',
          padding: '14px 20px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fecdd3',
          padding: '14px 20px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} color="#f43f5e" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: Non-Critical Editable Profile Details */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#818cf8" /> Editable Personal & Contact Details
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            Update non-critical personal contact info, bio, and social profile links
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
              Full Display Name
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
              Registered Email Address
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. student@campusmind.edu"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
              Contact Phone Number
            </label>
            <input
              type="text"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
              GitHub Profile URL
            </label>
            <input
              type="url"
              name="githubUrl"
              className="form-input"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
              Personal Academic Bio / Research Summary
            </label>
            <textarea
              name="bio"
              className="form-input"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Describe your academic goals or research focus..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save size={16} /> Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Section 2: Critical Institutional Credentials (LOCKED) */}
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} color="#f43f5e" /> Governance Credentials & Role Attributes (Locked 🔒)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            Critical institutional credentials are locked by academic policy and can only be modified by the Registrar / HOD
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              System Governance Role <Lock size={12} color="#f43f5e" />
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
              {user?.role || 'Student'}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Roll Number / University ID <Lock size={12} color="#f43f5e" />
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
              {user?.rollNumber || user?.studentId || 'STU1024'}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Department Assignment <Lock size={12} color="#f43f5e" />
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
              {user?.department || 'Computer Science & Engineering'}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Semester & Section <Lock size={12} color="#f43f5e" />
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
              {user?.semester ? `${user.semester}th Semester` : '6th Semester'} - {user?.section || 'Section A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
