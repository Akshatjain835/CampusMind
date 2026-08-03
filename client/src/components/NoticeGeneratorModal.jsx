import React, { useState } from 'react';
import { Sparkles, FileText, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const NoticeGeneratorModal = ({ isOpen, onClose, onNoticePublished }) => {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Academic');
  const [targetAudience, setTargetAudience] = useState('All');

  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAi = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setPublishSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notices/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, category, targetAudience })
      });
      const data = await res.json();
      if (res.ok) {
        setDraft(data);
      } else {
        setErrorMsg(data.message || 'Failed to generate AI notice draft');
      }
    } catch (err) {
      setErrorMsg('Error communicating with Notice Generator AI Agent');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNotice = async () => {
    if (!draft) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: draft.title,
          circularNumber: draft.circularNumber,
          category: draft.category,
          content: draft.content,
          targetAudience: draft.targetAudience
        })
      });

      if (res.ok) {
        setPublishSuccess(true);
        setTimeout(() => {
          setPublishSuccess(false);
          setDraft(null);
          setPrompt('');
          onNoticePublished();
          onClose();
        }, 1200);
      } else {
        const data = await res.json();
        setErrorMsg(data.message || 'Failed to publish notice');
      }
    } catch (err) {
      setErrorMsg('Failed to publish notice to MongoDB database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel animate-scale-in" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>AI Notice & Circular Generator</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fecdd3',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#f43f5e" />
            <span>{errorMsg}</span>
          </div>
        )}

        {publishSuccess && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: '#34d399',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} color="#34d399" />
            <span>Official Circular Published to Department Notice Board!</span>
          </div>
        )}

        {/* Prompt Input Form */}
        <form onSubmit={handleGenerateAi} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Notice Prompt / Requirements</label>
            <textarea
              required
              className="form-input"
              rows={3}
              placeholder="e.g. Generate 3rd year CSE mid-semester exam schedule notice starting from 15th August at Lab 3..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Academic">Academic Notice</option>
                <option value="Exam">Exam Schedule</option>
                <option value="Workshop">Workshop & Seminar</option>
                <option value="Event">Department Event</option>
                <option value="Urgent">Urgent Circular</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select 
                className="form-select"
                value={targetAudience} 
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                <option value="All">All Students & Faculty</option>
                <option value="Students">All Students</option>
                <option value="Faculty">Faculty Members Only</option>
                <option value="3rd Year CSE">3rd Year CSE</option>
                <option value="4th Year CSE">4th Year CSE</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !prompt.trim()}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={18} />
            {loading ? 'AI Agent Formatting Official Circular...' : 'Generate AI Circular Preview'}
          </button>
        </form>

        {/* AI Draft Preview Block */}
        {draft && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} /> Official Circular Preview
              </h4>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontWeight: 600 }}>
                {draft.circularNumber}
              </span>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              borderRadius: '10px',
              padding: '16px',
              whiteSpace: 'pre-wrap',
              fontSize: '0.85rem',
              color: '#f3f4f6',
              lineHeight: 1.6,
              fontFamily: 'monospace',
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              {draft.content}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDraft(null)} className="btn btn-secondary">
                Discard
              </button>
              <button onClick={handlePublishNotice} className="btn btn-primary" disabled={loading}>
                <Send size={16} /> Publish to Notice Board
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
