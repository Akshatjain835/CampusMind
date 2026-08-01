import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, User, GraduationCap, Briefcase, Award, ArrowRight, CheckCircle2, Lock, Mail, Database } from 'lucide-react';

export const LoginPage = () => {
  const { login, register, seedDemoData } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seedMessage, setSeedMessage] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [rollNumber, setRollNumber] = useState('');
  const [designation, setDesignation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password, role, department, rollNumber, designation });
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
      // If user doesn't exist yet, seed and retry automatically
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
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1080px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '40px',
        alignItems: 'center'
      }}>
        
        {/* Left Side: Brand Overview & AI Features */}
        <div className="animate-fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '24px' }}>
            <Sparkles size={16} color="#818cf8" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc' }}>Next-Gen Multi-Agent Governance</span>
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
            Academic Intelligence <br />
            <span className="gradient-text">Powered by LangGraph</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
            DepartmentAI coordinates specialized AI agents to automate student leave evaluations, timetable synthesis, notice generation, faculty workload tracking, and NAAC/NBA accreditation RAG search.
          </p>

          {/* Feature Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} color="#34d399" />
              <span style={{ fontWeight: 500, color: '#e5e7eb' }}>Role-Based Access for Students, Faculty, HOD & Admin</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} color="#38bdf8" />
              <span style={{ fontWeight: 500, color: '#e5e7eb' }}>FastAPI + LangChain + ChromaDB RAG Engine</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} color="#fbbf24" />
              <span style={{ fontWeight: 500, color: '#e5e7eb' }}>Automated Timetable & Circular Generation</span>
            </div>
          </div>

          {/* One-Click Seed Database Button */}
          <button 
            onClick={handleSeed} 
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <Database size={16} /> Seed Default Demo Database Accounts
          </button>
          {seedMessage && (
            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#34d399' }}>
              {seedMessage}
            </div>
          )}
        </div>

        {/* Right Side: Glassmorphic Auth Form */}
        <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
          
          {/* Tab Headers */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '28px'
          }}>
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: !isRegister ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: isRegister ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Login Chips */}
          {!isRegister && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px', letterSpacing: '0.05em' }}>
                ⚡ Quick Demo One-Click Sign In
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="demo-chip" onClick={() => handleQuickLogin('student@department.ai')}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>👨‍🎓 Student</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Rahul Sharma (Sem 6)</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 10px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>OR MANUAL CREDENTIALS</span>
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
          <form onSubmit={handleSubmit}>
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
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Department</label>
                  <select
                    className="form-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                {role === 'student' && (
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CS2024-042"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                    />
                  </div>
                )}

                {role === 'faculty' && (
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
              <label className="form-label">Institutional Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="name@department.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px' }}
            >
              {loading ? 'Authenticating...' : (
                <>
                  {isRegister ? 'Register Account' : 'Access System'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
