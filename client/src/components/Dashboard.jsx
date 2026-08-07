import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { LeaveManagement } from './LeaveManagement';
import { LeaveModal } from './LeaveModal';
import { StudentAttendanceModal } from './StudentAttendanceModal';
import { EnrolledCoursesModal } from './EnrolledCoursesModal';
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

const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const lineContent = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} style={{ color: '#818cf8', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (line.trim() === '') {
      return <div key={idx} style={{ height: '6px' }} />;
    }

    if (line.startsWith('•') || line.startsWith('-')) {
      return (
        <div key={idx} style={{ paddingLeft: '14px', margin: '3px 0', color: '#e2e8f0' }}>
          {lineContent}
        </div>
      );
    }

    return (
      <div key={idx} style={{ margin: '3px 0', color: '#f1f5f9' }}>
        {lineContent}
      </div>
    );
  });
};

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState([]);

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
      const response = await fetch('/api/ai/stream-query', {
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

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let placeholderIndex = -1;
        setChatLogs(prev => {
          placeholderIndex = prev.length;
          return [
            ...prev,
            {
              sender: 'agent',
              role: 'Autonomous Multi-Agent System',
              text: '🔄 *Initializing multi-agent graph execution...*'
            }
          ];
        });

        let accumulatedResponse = '';
        let currentChain = [];

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.chain && parsed.chain.length > 0) {
                  currentChain = parsed.chain;
                }
                if (parsed.final_response) {
                  accumulatedResponse = parsed.final_response;
                }

                const roleTitle = currentChain.length > 0 
                  ? `Multi-Agent System (${currentChain.join(' ➔ ')})`
                  : 'Autonomous Agent';

                const displayContent = accumulatedResponse || `🔄 *Executing Node: ${parsed.agent || parsed.node || 'Processing'}...*`;

                setChatLogs(prev => {
                  const updated = [...prev];
                  if (updated.length > 0) {
                    updated[updated.length - 1] = {
                      sender: 'agent',
                      role: roleTitle,
                      text: displayContent
                    };
                  }
                  return updated;
                });
              } catch (e) {}
            }
          }
        }
      } else {
        const fallbackRes = await fetch('/api/ai/query', {
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
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setChatLogs(prev => [
            ...prev,
            {
              sender: 'agent',
              role: data.role || 'LangGraph AI Agent',
              text: data.text || data.final_response || 'No response returned.'
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Streaming connection error:', err);
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
        setChatLogs([]);
      }
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top Navbar */}
      <Navbar />

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
              <div 
                className="glass-card hover:border-emerald-500/50 transition-all duration-200" 
                onClick={() => setShowAttendanceModal(true)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Click to view subject-wise attendance & AI predictor"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overall Attendance</span>
                  <TrendingUp size={20} color="#34d399" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>84.5%</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Eligible for End-Sem Exam</span>
                  <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>View Breakdown ➔</span>
                </div>
              </div>

              <div 
                className="glass-card hover:border-cyan-500/50 transition-all duration-200" 
                onClick={() => setShowCoursesModal(true)}
                style={{ cursor: 'pointer' }}
                title="Click to view course curriculum & assigned faculty"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enrolled Courses</span>
                  <BookOpen size={20} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>6 Subjects</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Current Semester (Sem 6)</span>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>View Syllabus ➔</span>
                </div>
              </div>

              <div 
                className="glass-card hover:border-amber-500/50 transition-all duration-200" 
                onClick={() => setShowLeaveModal(true)}
                style={{ cursor: 'pointer' }}
                title="Click to apply or track leave requests"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Leave Applications</span>
                  <Clock size={20} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>1 Pending</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>AI Recommendation: Approve</span>
                  <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>Apply Leave ➔</span>
                </div>
              </div>

              <div 
                className="glass-card hover:border-purple-500/50 transition-all duration-200" 
                onClick={() => {
                  const el = document.getElementById('notice-board-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ cursor: 'pointer' }}
                title="Click to view department notice circulars"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Department Notices</span>
                  <FileText size={20} color="#c084fc" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>3 Unread</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Exam Circular & Workshop</span>
                  <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 700 }}>Read Notices ➔</span>
                </div>
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
              background: 'rgba(15, 23, 42, 0.65)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              maxHeight: '420px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '16px'
            }}>
              {chatLogs.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 20px', fontSize: '0.92rem' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🤖</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>DepartmentAI Academic Secretary</div>
                  <div>Ask about attendance rules, leave applications, faculty scheduling, or university regulations.</div>
                </div>
              )}
              {chatLogs.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    background: msg.sender === 'user' 
                      ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                      : 'rgba(30, 41, 59, 0.85)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(129, 140, 248, 0.25)',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    fontSize: '0.92rem',
                    lineHeight: 1.65,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  {msg.role && (
                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#34d399',
                      marginBottom: '8px',
                      paddingBottom: '4px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Sparkles size={13} color="#34d399" />
                      {msg.role}
                    </div>
                  )}
                  {renderFormattedText(msg.text)}
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
        <div id="notice-board-section">
          <NoticeBoard />
        </div>

        {/* Weekly Interactive Timetable Grid */}
        <TimetableGrid />

        {/* Department Meeting Scheduler & Reminders */}
        <MeetingScheduler />

        {/* Real-time Department Performance Analytics */}
        <DepartmentAnalytics />

        {/* Modules Grid */}
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>Governance & Management Modules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setShowAttendanceModal(true)}>
            <Calendar size={24} color="#38bdf8" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Attendance & Eligibility</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Check course-wise attendance percentage, eligibility for end-sem exams, and condonation rules.
            </p>
          </div>

          <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setShowLeaveModal(true)}>
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

          <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setShowCoursesModal(true)}>
            <BookOpen size={24} color="#c084fc" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>RAG Regulation Search</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Query NBA/NAAC manuals, academic handbooks, and exam guidelines using Vector DB RAG.
            </p>
          </div>

        </div>

        {/* Interactive Student Modals */}
        <StudentAttendanceModal 
          isOpen={showAttendanceModal} 
          onClose={() => setShowAttendanceModal(false)} 
          user={user} 
        />
        <EnrolledCoursesModal 
          isOpen={showCoursesModal} 
          onClose={() => setShowCoursesModal(false)} 
          user={user} 
        />
        <LeaveModal 
          isOpen={showLeaveModal} 
          onClose={() => setShowLeaveModal(false)} 
        />
        {/* Floating Fixed Bottom-Right AI Assistant Trigger Button */}
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000 }}>
          <button
            onClick={() => setAiChatOpen(!aiChatOpen)}
            className="btn btn-primary"
            style={{
              borderRadius: '50px',
              padding: '14px 22px',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={20} className="animate-pulse" />
            {aiChatOpen ? 'Close AI Assistant' : 'AI Multi-Agent Secretary'}
          </button>
        </div>

      </main>
    </div>
  );
};
