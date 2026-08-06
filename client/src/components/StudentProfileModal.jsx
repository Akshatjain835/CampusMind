import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, Lock, FileText, Camera, Link, Save, ShieldCheck, Github, Linkedin, ExternalLink } from 'lucide-react';

export const StudentProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();

  const isStudent = user?.role === 'student';

  // Normal Editable Details
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || user?.avatar || '');
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await updateUserProfile({
        name,
        email,
        phone,
        bio,
        profilePic,
        resumeUrl,
        githubUrl,
        linkedinUrl,
        password: password.trim() ? password : undefined
      });

      setMessage('✅ Student profile & resume updated successfully!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-scale-in" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
        border: '1px solid rgba(99, 102, 241, 0.35)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #818cf8',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={26} color="#818cf8" />
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Student Profile & Portfolio</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {user?.name} • Roll: {user?.rollNumber || 'CS2024-042'} ({user?.section || 'Section A'})
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

        {message && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fecdd3',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        {/* 🔒 Critical Academic Parameters (READ-ONLY for Students) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
              <Lock size={14} color="#fbbf24" /> Critical Academic Details (Read-Only)
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Managed by HOD / Admin
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Role</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginTop: '2px' }}>
                {user?.role} 🔒
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Roll Number</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e5e7eb', marginTop: '2px' }}>
                {user?.rollNumber || 'CS2024-042'} 🔒
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Section & Sem</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e5e7eb', marginTop: '2px' }}>
                {user?.section || 'Section A'} (Sem {user?.semester || 6}) 🔒
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Department</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e5e7eb', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.department || 'CSE'} 🔒
              </div>
            </div>
          </div>
        </div>

        {/* ✏️ Editable Personal Details & Resume Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            ✏️ Editable Personal Profile & Resume Media
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Photo URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/photo-..."
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
              />
            </div>
          </div>

          {/* Resume PDF Link & Preview */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                📄 Resume / CV Document Link (PDF / Google Drive URL)
              </label>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Preview Resume <ExternalLink size={12} />
                </a>
              )}
            </div>
            <input
              type="url"
              className="form-input"
              placeholder="https://drive.google.com/file/d/your-resume-pdf/view"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
            />
          </div>

          {/* Social Links (GitHub & LinkedIn) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Github size={14} color="#a5b4fc" /> GitHub Profile
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Linkedin size={14} color="#38bdf8" /> LinkedIn Profile
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Bio Summary */}
          <div className="form-group">
            <label className="form-label">Bio / Academic Summary</label>
            <textarea
              rows={2}
              className="form-input"
              placeholder="3rd Year Computer Science student passionate about AI Agents & Full Stack Dev..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Password Update */}
          <div className="form-group">
            <label className="form-label">Update Password (Leave blank to keep current)</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {loading ? 'Saving Changes...' : 'Save Profile & Resume'}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
};
