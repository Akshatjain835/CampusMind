import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle, CheckCircle2, FileText, Calendar } from 'lucide-react';

export const LeaveModal = ({ isOpen, onClose, onLeaveApplied }) => {
  const [leaveType, setLeaveType] = useState('Medical');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ leaveType, startDate, endDate, reason })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit leave request');
      }

      setAiResult(data.aiRecommendation);
      if (onLeaveApplied) onLeaveApplied(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Approve':
        return { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)', color: '#34d399' };
      case 'Needs Review':
        return { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' };
      case 'Reject':
        return { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc' };
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
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '32px',
        position: 'relative'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Sparkles size={22} color="#818cf8" />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Apply for Leave (AI Recommendation Enabled)</h3>
        </div>

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

        {aiResult ? (
          <div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-glow)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  AI Agent Evaluation Result:
                </span>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: getBadgeStyle(aiResult.recommendedStatus).bg,
                  border: `1px solid ${getBadgeStyle(aiResult.recommendedStatus).border}`,
                  color: getBadgeStyle(aiResult.recommendedStatus).color
                }}>
                  {aiResult.recommendedStatus.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#e5e7eb', marginBottom: '10px' }}>
                {aiResult.reasoning}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
                📊 {aiResult.attendanceImpact}
              </div>
            </div>

            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Leave Category</label>
              <select
                className="form-select"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="Medical">Medical Leave (Requires Cert if >3 days)</option>
                <option value="Casual">Casual Leave</option>
                <option value="Duty">Duty Leave (Hackathon / Placement / Sports)</option>
                <option value="Academic">Academic Leave</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason & Justification</label>
              <textarea
                required
                rows={3}
                className="form-input"
                placeholder="Detail reason for leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px' }}
            >
              {loading ? 'Evaluating via AI Agent...' : 'Submit & Evaluate Leave'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
