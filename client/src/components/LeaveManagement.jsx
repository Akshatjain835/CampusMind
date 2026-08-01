import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LeaveModal } from './LeaveModal';
import {
  FileText, Plus, CheckCircle2, XCircle, Clock,
  Sparkles, User, AlertCircle, ShieldCheck
} from 'lucide-react';

export const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(user?.role === 'student' ? 'my-leaves' : 'pending-approvals');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = (activeTab === 'my-leaves' || user?.role === 'student')
        ? '/api/leaves/my-leaves'
        : '/api/leaves/pending';

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setLeaves(data);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeTab]);

  const [errorMsg, setErrorMsg] = useState('');

  const handleReviewLeave = async (leaveId, status) => {
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leaves/${leaveId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Action denied by Governance Authority Matrix.');
        return;
      }
      fetchLeaves();
    } catch (err) {
      setErrorMsg('Failed to process review action.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>APPROVED</span>;
      case 'Rejected':
        return <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', fontSize: '0.75rem', fontWeight: 700 }}>REJECTED</span>;
      default:
        return <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>PENDING</span>;
    }
  };

  const getAiBadgeStyle = (rec) => {
    switch (rec) {
      case 'Approve':
        return { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399' };
      case 'Needs Review':
        return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' };
      case 'Reject':
        return { bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' };
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px', marginBottom: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Leave Governance System</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            AI-driven attendance threshold verification and condonation assessment
          </p>
        </div>

        {user?.role === 'student' ? (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Apply for Leave
          </button>
        ) : (
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('pending-approvals')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'pending-approvals' ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Pending Approvals
            </button>
            <button
              onClick={() => setActiveTab('my-leaves')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'my-leaves' ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              My Leaves
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fecdd3',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldCheck size={18} color="#f43f5e" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Leave List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading leave applications...
        </div>
      ) : leaves.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
          No leave applications found in this view.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                      {leave.applicant?.name || 'Applicant'}
                      {leave.applicant?.rollNumber && ` (${leave.applicant.rollNumber})`}
                    </h4>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {leave.leaveType} Leave
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Duration: {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getStatusBadge(leave.status)}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong>Reason:</strong> {leave.reason}
              </p>

              {/* AI Agent Recommendation Card */}
              {leave.aiRecommendation && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color="#818cf8" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc' }}>
                        AI Recommendation Agent Evaluation
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: getAiBadgeStyle(leave.aiRecommendation.recommendedStatus).bg,
                      color: getAiBadgeStyle(leave.aiRecommendation.recommendedStatus).color
                    }}>
                      {leave.aiRecommendation.recommendedStatus?.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#e5e7eb', lineHeight: 1.4 }}>
                    {leave.aiRecommendation.reasoning}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
                    <span>📊 {leave.aiRecommendation.attendanceImpact}</span>
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>
                      🔒 Concerned Authority: {leave.applicant?.department || 'CSE'} Department Only
                    </span>
                  </div>
                </div>
              )}

              {/* Review Action Buttons for Faculty/HOD */}
              {user?.role !== 'student' && leave.status === 'Pending' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: user?.department === (leave.applicant?.department || 'Computer Science & Engineering') || user?.role === 'admin' ? '#34d399' : '#f43f5e' }}>
                    {user?.department === (leave.applicant?.department || 'Computer Science & Engineering') || user?.role === 'admin'
                      ? '✓ Authorized Concerned Department Reviewer'
                      : '🔒 Restricted: Must be Concerned Department Authority'}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleReviewLeave(leave._id, 'Rejected')}
                      className="btn btn-secondary"
                      style={{ padding: '6px 16px', fontSize: '0.85rem', color: '#f43f5e' }}
                    >
                      <XCircle size={16} /> Reject Leave
                    </button>
                    <button
                      onClick={() => handleReviewLeave(leave._id, 'Approved')}
                      className="btn btn-primary"
                      style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                    >
                      <CheckCircle2 size={16} /> Approve Leave
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Leave Application Modal */}
      <LeaveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLeaveApplied={() => fetchLeaves()}
      />

    </div>
  );
};
