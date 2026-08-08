import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { HITLApprovalModal } from '../components/HITLApprovalModal';
import {
  Sparkles,
  Send,
  Trash2,
  CheckCircle2,
  GitBranch,
  Bot,
  User as UserIcon,
  Activity,
  AlertTriangle
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

    if (line.startsWith('>')) {
      return (
        <div key={idx} style={{
          borderLeft: '3px solid #38bdf8',
          background: 'rgba(56, 189, 248, 0.08)',
          padding: '8px 12px',
          margin: '6px 0',
          borderRadius: '0 8px 8px 0',
          fontSize: '0.86rem',
          color: '#cbd5e1',
          fontStyle: 'italic'
        }}>
          {line.slice(1).trim()}
        </div>
      );
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

export const AISecretaryPage = () => {
  const { user } = useAuth();
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState([]);
  const [activeChain, setActiveChain] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hitlContext, setHitlContext] = useState(null);

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat as message log grows or streams
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs, activeChain, isStreaming]);

  // Fetch persistent chat history on load
  useEffect(() => {
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

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isStreaming) return;

    const userText = chatMessage;
    setChatMessage('');
    setIsStreaming(true);

    const initialUserMsg = { sender: 'user', role: user?.role || 'student', text: userText };
    setChatLogs(prev => [...prev, initialUserMsg]);

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
          user_role: user?.role || 'student',
          student_id: user?.rollNumber || user?.studentId || user?._id
        })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        setChatLogs(prev => [
          ...prev,
          {
            sender: 'agent',
            role: 'Multi-Agent System (Initializing)',
            text: '🔄 *Initializing multi-agent graph execution...*'
          }
        ]);

        let accumulatedResponse = '';
        let currentChain = [];
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const line = part.trim();
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                
                if (parsed.error) {
                  setChatLogs(prev => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                      updated[updated.length - 1] = {
                        sender: 'agent',
                        role: 'CampusMind AI System Alert',
                        text: `⚠️ **System Notice:** ${parsed.error}\n\nFalling back to local governance mode...`
                      };
                    }
                    return updated;
                  });
                  continue;
                }

                if (parsed.chain && parsed.chain.length > 0) {
                  currentChain = parsed.chain;
                  setActiveChain(parsed.chain);
                }

                if (parsed.final_response) {
                  accumulatedResponse = parsed.final_response;
                }

                if (parsed.needs_human_approval && parsed.human_approval_context) {
                  setHitlContext(parsed.human_approval_context);
                }

                const roleTitle = currentChain.length > 0 
                  ? `Multi-Agent System (${currentChain.join(' ➔ ')})`
                  : 'Autonomous Agent';

                const rawNode = parsed.agent || parsed.node || 'Processing';
                const cleanNode = rawNode.replace('__interrupt__', 'Governance Check').replace('__start__', 'Initialization');
                const displayContent = accumulatedResponse || `🔄 *Executing Node: ${cleanNode}...*`;

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
              } catch (e) {
                console.error('SSE JSON error:', e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming connection error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleHITLApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/ai/human-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: true, context: hitlContext })
      });
      setHitlContext(null);
      setChatLogs(prev => [
        ...prev,
        { sender: 'agent', role: 'HOD Sanction Authority', text: '✅ **Human-in-the-Loop Sanction Approved!** Resuming multi-agent workflow execution...' }
      ]);
    } catch (e) {
      setHitlContext(null);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat history?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/ai/chat-history', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setChatLogs([]);
      setActiveChain([]);
    } catch (e) { }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', height: 'calc(100vh - 134px)' }}>
      {/* Left Chat Window */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '24px', height: '100%' }}>
        {/* Chat Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={24} color="#818cf8" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>DepartmentAI Secretary</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>LangGraph Multi-Agent Orchestrator</p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Trash2 size={14} /> Clear History
          </button>
        </div>

        {/* Chat Logs List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '8px' }}>
          {chatLogs.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto', maxWidth: '400px' }}>
              <Sparkles size={36} color="#818cf8" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                How can I assist your governance needs today?
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                Ask about 5-day medical leave, attendance thresholds, exam condonation rules, GPU lab slots, or faculty workloads.
              </p>
            </div>
          )}

          {chatLogs.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.sender === 'user'
                  ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                  : 'rgba(30, 41, 59, 0.85)',
                border: msg.sender === 'user' ? 'none' : '1px solid rgba(129, 140, 248, 0.25)',
                padding: '14px 18px',
                borderRadius: '16px',
                fontSize: '0.9rem',
                lineHeight: 1.6
              }}
            >
              {msg.role && (
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#34d399',
                  marginBottom: '6px',
                  paddingBottom: '4px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Sparkles size={12} color="#34d399" />
                  {msg.role}
                </div>
              )}
              {renderFormattedText(msg.text)}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask about medical leave, attendance rules, GPU labs, or exam eligibility..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            disabled={isStreaming}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={isStreaming} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} /> {isStreaming ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Right Side: Visual LangGraph Agent Execution Flow */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <GitBranch size={18} color="#a855f7" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>LangGraph Execution Flow</h4>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
          Live agent graph execution trajectory and state checkpoints.
        </p>

        {/* Step-by-Step Agent DAG Trace Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['Long-Term Memory Store', 'Planner Agent', 'Attendance Agent', 'Regulation RAG Agent', 'Leave Agent', 'Analytics Agent', 'Critic Agent', 'Response Generator'].map((agentName, index) => {
            const isActive = activeChain.includes(agentName);
            const isLatest = activeChain[activeChain.length - 1] === agentName;

            return (
              <div
                key={index}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isLatest 
                    ? '1px solid #818cf8' 
                    : isActive 
                      ? '1px solid rgba(99, 102, 241, 0.3)' 
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? '#818cf8' : '#64748b' }}>
                    #{index + 1}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#f8fafc' : '#94a3b8' }}>
                    {agentName}
                  </span>
                </div>

                {isActive && (
                  <CheckCircle2 size={14} color="#34d399" />
                )}
              </div>
            );
          })}
        </div>
      </div>


      {/* HITL Modal Integration */}
      <HITLApprovalModal
        isOpen={!!hitlContext}
        onClose={() => setHitlContext(null)}
        approvalContext={hitlContext}
        onApprove={handleHITLApprove}
        onReject={() => setHitlContext(null)}
      />
    </div>
  );
};
