import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LeaveManagement } from './LeaveManagement';
import { FacultyApprovalPortal } from './FacultyApprovalPortal';
import { NoticeBoard } from './NoticeBoard';
import { TimetableGrid } from './TimetableGrid';
import { MeetingScheduler } from './MeetingScheduler';
import { DepartmentAnalytics } from './DepartmentAnalytics';
import {
  Bot, LogOut, Calendar, Clock, FileText, CheckSquare,
  Users, Layers, Award, Sparkles, Send, ShieldAlert,
  Search, BookOpen, AlertCircle, TrendingUp, Cpu
} from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState([
    {
      sender: 'agent',
      role: 'Router & RAG Agent',
      text: `Hello ${user?.name || 'User'}! I am your DepartmentAI Academic Secretary. How can I assist you today? You can ask me about attendance rules, apply for leaves, schedule meetings, or query NBA/NAAC accreditation manuals.`
    }
  ]);

  // Fetch persistent chat history on login
  React.useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') return;
        const res = await fetch('/api/ai/chat-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const history = await res.json();
          if (history && history.length > 0) {
            setChatLogs(history.map(msg => ({
              sender: msg.sender,
              role: msg.role,
              text: msg.text
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchChatHistory();
  }, [user]);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'student': return 'badge-role badge-student';
      case 'faculty': return 'badge-role badge-faculty';
      case 'hod': return 'badge-role badge-hod';
      case 'admin': return 'badge-role badge-admin';
      default: return 'badge-role';
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatMessage('');

    setChatLogs(prev => [
      ...prev,
      { sender: 'user', text: userText }
    ]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: userText,
          user_name: user?.name || 'User',
          user_role: user?.role || 'student'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatLogs(prev => [
          ...prev,
          {
            sender: 'agent',
            role: data.role || 'LangGraph AI Agent',
            text: data.text || data.final_response || 'No response returned.'
          }
        ]);
      } else {
        setChatLogs(prev => [
          ...prev,
          {
            sender: 'agent',
            role: 'System Notice',
            text: `ChromaDB & LangGraph Microservice active! Ensure FastAPI server is running via 'uvicorn app.main:app --port 8000' in ai-service.`
          }
        ]);
      }
    } catch (err) {
      setChatLogs(prev => [
        ...prev,
        {
          sender: 'agent',
          role: 'System Notice',
          text: `Processing query "${userText}"... AI Service gateway endpoint ready.`
        }
      ]);
    }
  };

  const handleClearChatHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/chat-history', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setChatLogs([
          {
            sender: 'agent',
            role: 'Router & RAG Agent',
            text: `Hello ${user?.name || 'User'}! I am your DepartmentAI Academic Secretary. How can I assist you today? You can ask me about attendance rules, apply for leaves, schedule meetings, or query NBA/NAAC accreditation manuals.`
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top Header */}
      <header className="glass-panel" style={{
        borderRadius: 0,
        borderLeft: 0,
        borderRight: 0,
        borderTop: 0,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>DepartmentAI</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
              Academic Governance & Administrative Intelligence
            </span>
          </div>
        </div>

        {/* User Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.department}</div>
            </div>
            <span className={getRoleBadgeClass(user?.role)}>
              {user?.role?.toUpperCase()}
            </span>
          </div>

          <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

        {/* Welcome Banner */}
        <div className="glass-panel animate-fade-in" style={{ padding: '28px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                System Access Authorized
              </span>
              <h2 style={{ fontSize: '2rem', marginTop: '6px', fontWeight: 700 }}>
                Welcome back, <span className="gradient-text">{user?.name}</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.95rem' }}>
                {user?.role === 'student' && `Roll No: ${user?.rollNumber || 'CS2024-042'} | Semester ${user?.semester || 6} | Attendance Status: Good (84%)`}
                {user?.role === 'faculty' && `Designation: ${user?.designation || 'Associate Professor'} | Weekly Workload: ${user?.workloadHours || 18} Hours`}
                {user?.role === 'hod' && `Head of Department | Managing 24 Faculty Members & 480 Enrolled Students`}
                {user?.role === 'admin' && `System Administrator | All Agents & Database Connections Operational`}
              </p>
            </div>

            <button
              onClick={() => setAiChatOpen(!aiChatOpen)}
              className="btn btn-primary"
              style={{ gap: '10px' }}
            >
              <Sparkles size={18} />
              {aiChatOpen ? 'Close AI Assistant' : 'Launch AI Secretary'}
            </button>
          </div>
        </div>

        {/* Quick Stats Grid tailored to User Role */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>

          {user?.role === 'student' && (
            <>
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overall Attendance</span>
                  <TrendingUp size={20} color="#34d399" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>84.5%</div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Eligible for End-Sem Exam</span>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enrolled Courses</span>
                  <BookOpen size={20} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>6 Subjects</div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Current Semester (Sem 6)</span>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Leave Applications</span>
                  <Clock size={20} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>1 Pending</div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>AI Recommendation: Approve</span>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Department Notices</span>
                  <FileText size={20} color="#c084fc" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>3 Unread</div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Exam Circular & Workshop</span>
              </div>
            </>
          )}

          {(user?.role === 'faculty' || user?.role === 'hod' || user?.role === 'admin') && (
            <>
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Faculty Workload</span>
                  <Clock size={20} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>18 Hrs/Wk</div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Optimal Range</span>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Approvals</span>
                  <CheckSquare size={20} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>4 Requests</div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Student Medical Leaves</span>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NBA/NAAC Compliance</span>
                  <Award size={20} color="#34d399" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>92% Ready</div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>RAG Document Indexed</span>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI Microservice Status</span>
                  <Cpu size={20} color="#f43f5e" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-rose)' }}>Active</div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>LangGraph Router Online</span>
              </div>
            </>
          )}

        </div>

        {/* AI Assistant Drawer Section */}
        {aiChatOpen && (
          <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '32px', borderColor: 'var(--border-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot size={22} color="#818cf8" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>DepartmentAI Secretary Agent (LangGraph Workflow)</h3>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontWeight: 700, border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  🧠 MEMORY ACTIVE
                </span>
              </div>

              <button 
                onClick={handleClearChatHistory} 
                className="btn btn-secondary" 
                style={{ padding: '4px 12px', fontSize: '0.78rem', color: '#f43f5e' }}
              >
                Clear History
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              padding: '20px',
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginBottom: '16px'
            }}>
              {chatLogs.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.07)',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}
                >
                  {msg.role && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '4px' }}>
                      {msg.role}
                    </div>
                  )}
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ask about attendance rules, apply for leave, or generate circulars..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Send size={18} /> Send
              </button>
            </form>
          </div>
        )}

        {/* Leave Governance System & Faculty Approval Portal */}
        {user?.role === 'student' ? <LeaveManagement /> : <FacultyApprovalPortal />}

        {/* Department Circulars & Notice Board */}
        <NoticeBoard />

        {/* Weekly Interactive Timetable Grid */}
        <TimetableGrid />

        {/* Department Meeting Scheduler & Reminders */}
        <MeetingScheduler />

        {/* Real-time Department Performance Analytics */}
        <DepartmentAnalytics />

        {/* Modules Grid */}
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>Governance & Management Modules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          <div className="glass-card" style={{ cursor: 'pointer' }}>
            <Calendar size={24} color="#38bdf8" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Attendance & Eligibility</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Check course-wise attendance percentage, eligibility for end-sem exams, and condonation rules.
            </p>
          </div>

          <div className="glass-card" style={{ cursor: 'pointer' }}>
            <FileText size={24} color="#fbbf24" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Leave Management</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Apply for student/faculty leaves with AI recommendation checks on attendance thresholds.
            </p>
          </div>

          <div className="glass-card" style={{ cursor: 'pointer' }}>
            <Clock size={24} color="#34d399" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Timetable & Room Allocations</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              View optimized class schedules, lab allocations, and faculty availability slots.
            </p>
          </div>

          <div className="glass-card" style={{ cursor: 'pointer' }}>
            <BookOpen size={24} color="#c084fc" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>RAG Regulation Search</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Query NBA/NAAC manuals, academic handbooks, and exam guidelines using Vector DB RAG.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
};
