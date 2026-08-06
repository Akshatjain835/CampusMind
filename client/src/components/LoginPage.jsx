import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Sparkles, User, GraduationCap, Briefcase, 
  Award, ArrowRight, CheckCircle2, Lock, Mail, 
  Database, ChevronDown, ChevronUp, Cpu, KeyRound 
} from 'lucide-react';

const DEPARTMENT_SECTIONS = {
  'Computer Science & Engineering': ['Section A', 'Section B', 'Section C', 'Section D'],
  'Information Technology': ['Section IT-1', 'Section IT-2'],
  'Electronics & Communication Engineering': ['Section E', 'Section F'],
  'Electrical Engineering': ['Section G', 'Section H'],
  'Mechanical Engineering': ['Section K', 'Section L'],
  'Civil Engineering': ['Section M', 'Section N'],
  'Applied Sciences & Humanities': ['Section S1', 'Section S2']
};

export const LoginPage = () => {
  const { login, register, seedDemoData } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seedMessage, setSeedMessage] = useState('');
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [section, setSection] = useState('Section A');
  const [rollNumber, setRollNumber] = useState('');
  const [designation, setDesignation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password, role, department, section, rollNumber, designation });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword = 'password123') => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err) {
      setError('User not found. Auto-seeding database demo accounts...');
      await seedDemoData();
      try {
        await login(demoEmail, demoPassword);
      } catch (retryErr) {
        setError('Login failed after seeding. Ensure backend server & MongoDB are running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeedMessage('Seeding database...');
    const result = await seedDemoData();
    if (result) {
      setSeedMessage('✅ Demo accounts seeded! Default password: password123');
    } else {
      setSeedMessage('❌ Failed to seed. Check server connection.');
    }
    setTimeout(() => setSeedMessage(''), 5000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Ambient Glowing Background Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '1120px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '48px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Left Side: Brand Overview & AI Features */}
        <div className="animate-fade-in">
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '30px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            marginBottom: '24px'
          }}>
            <Sparkles size={16} color="#818cf8" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.02em' }}>
              Autonomous Multi-Agent Academic Portal
            </span>
          </div>

          <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            CampusMind AI <br />
            <span className="gradient-text">Powered by LangGraph</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '32px' }}>
            An intelligent departmental governance system that coordinates AI agents to automate leave evaluations, conflict-free timetable synthesis, circular generation, meeting scheduling, and NAAC/NBA accreditation RAG search.
          </p>

          {/* Feature Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)' }}>
                <CheckCircle2 size={18} color="#34d399" />
              </div>
              <span style={{ fontWeight: 600, color: '#e5e7eb', fontSize: '0.95rem' }}>
                Role-Based Governance for Student, Faculty, HOD & Admin
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)' }}>
                <Cpu size={18} color="#38bdf8" />
              </div>
              <span style={{ fontWeight: 600, color: '#e5e7eb', fontSize: '0.95rem' }}>
                LangGraph State Machine & Qdrant Vector RAG Engine
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(251, 191, 36, 0.15)' }}>
                <Award size={18} color="#fbbf24" />
              </div>
              <span style={{ fontWeight: 600, color: '#e5e7eb', fontSize: '0.95rem' }}>
                Automated Meeting Invitations & Real-Time Performance Analytics
              </span>
            </div>
          </div>

          {/* Seed Database Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={handleSeed} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.85rem', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Database size={16} color="var(--accent-purple)" /> Seed Demo Accounts
            </button>
            {seedMessage && (
              <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>
                {seedMessage}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Glassmorphic Auth Card */}
        <div className="glass-panel animate-fade-in" style={{
          padding: '36px',
          borderColor: 'rgba(129, 140, 248, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          
          {/* Tab Headers */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: !isRegister ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: isRegister ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Login Collapsible Section */}
          {!isRegister && (
            <div style={{ marginBottom: '24px' }}>
              <div 
                onClick={() => setShowDemoDrawer(!showDemoDrawer)}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '12px'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚡ Quick Demo Access (1-Click Switch)
                </span>
                {showDemoDrawer ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>

              {showDemoDrawer && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="animate-fade-in">
                  <div className="demo-chip" onClick={() => handleQuickLogin('student@department.ai')}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>👨‍🎓 Student</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Rahul (Sem 6)</span>
                  </div>
                  <div className="demo-chip" onClick={() => handleQuickLogin('faculty@department.ai')}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>👩‍🏫 Faculty</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Dr. Anita Verma</span>
                  </div>
                  <div className="demo-chip" onClick={() => handleQuickLogin('hod@department.ai')}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)' }}>👔 HOD</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Prof. R.K. Gupta</span>
                  </div>
                  <div className="demo-chip" onClick={() => handleQuickLogin('admin@department.ai')}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-rose)' }}>🛡️ Admin</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>System Admin</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 10px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>OR ENTER CREDENTIALS</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fecdd3',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Akshat Jain"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="hod">Head of Department (HOD)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setDepartment(newDept);
                      const availableSections = DEPARTMENT_SECTIONS[newDept] || ['Section A'];
                      setSection(availableSections[0]);
                    }}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Applied Sciences & Humanities">Applied Sciences & Humanities</option>
                  </select>
                </div>

                {role === 'student' && (
                  <div className="form-group">
                    <label className="form-label">Assigned Section</label>
                    <select
                      className="form-select"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                    >
                      {(DEPARTMENT_SECTIONS[department] || ['Section A']).map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                )}

                {role === 'student' && (
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 21109901"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                    />
                  </div>
                )}

                {(role === 'faculty' || role === 'hod') && (
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Associate Professor"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@university.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Authenticating...' : (isRegister ? 'Register Account' : 'Sign In')}
              <ArrowRight size={18} />
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};
