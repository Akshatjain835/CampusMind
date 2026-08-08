import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, XCircle, Clock, Sparkles, User, 
  ShieldAlert, ShieldCheck, Filter, Search, Award, RefreshCw 
} from 'lucide-react';

import { LoadingState, EmptyState, ErrorState } from './StateFeedback';

export const FacultyApprovalPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchLeaves = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'pending' ? '/api/leaves/pending' : '/api/leaves/history';
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLeaves(data);
      } else {
        setErrorMsg(data.message || 'Failed to fetch leave requests');
      }
    } catch (err) {
      setErrorMsg('Network error while connecting to DepartmentAI server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeTab]);

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
        setErrorMsg(data.message || 'Authority Denied by Governance Matrix.');
        return;
      }
      fetchLeaves();
    } catch (err) {
      setErrorMsg('Failed to execute review action.');
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
        return { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)', color: '#34d399' };
      case 'Needs Review':
        return { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' };
      case 'Reject':
        return { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc' };
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const applicantName = l.applicant?.name?.toLowerCase() || '';
    const roll = l.applicant?.rollNumber?.toLowerCase() || '';
    const matchesSearch = applicantName.includes(searchTerm.toLowerCase()) || roll.includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || l.leaveType?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const isConcernedAuthority = (leave) => {
    const studentDept = leave.applicant?.department || 'Computer Science & Engineering';
    return user?.role === 'admin' || user?.department === studentDept;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px', marginBottom: '32px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Award size={22} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Faculty & HOD Approval Portal</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Academic Governance Portal for <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{user?.department || 'Computer Science & Engineering'}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={fetchLeaves} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} /> Refresh
          </button>

          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'pending' ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              ⏳ Pending Approvals ({leaves.filter(l => l.status === 'Pending').length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              📜 Reviewed History
            </button>
          </div>
        </div>
      </div>

      {/* Error / Warning Alert Banner */}
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
          <ShieldAlert size={18} color="#f43f5e" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search applicant name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Leave Types</option>
          <option value="medical">Medical Leave</option>
          <option value="casual">Casual Leave</option>
          <option value="duty">Duty Leave</option>
          <option value="academic">Academic Leave</option>
        </select>
      </div>

      {/* Main List Rendering */}
      {loading ? (
        <LoadingState message="Loading pending leave approvals..." />
      ) : filteredLeaves.length === 0 ? (
        <EmptyState
          title={activeTab === 'pending' ? 'No pending approvals' : 'No reviewed leave history'}
          description={activeTab === 'pending' ? "✓ You're all caught up. All submitted leave requests have been reviewed." : "No historical leave applications recorded for this filter."}
          icon={CheckCircle2}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredLeaves.map((leave) => {
            const authorized = isConcernedAuthority(leave);
            const aiBadge = getAiBadgeStyle(leave.aiRecommendation?.recommendedStatus);

            return (
              <div 
                key={leave._id} 
                className="glass-card animate-fade-in" 
                style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: `4px solid ${aiBadge.color}` }}
              >
                {/* Top Row: Applicant Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                        {leave.applicant?.name || 'Applicant'} 
                        {leave.applicant?.rollNumber && ` (${leave.applicant.rollNumber})`}
                      </h4>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        padding: '2px 10px', 
                        borderRadius: '12px', 
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-dim)',
                        fontWeight: 600
                      }}>
                        {leave.applicant?.department || 'CSE'} Department
                      </span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        padding: '2px 10px', 
                        borderRadius: '12px', 
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        fontWeight: 600
                      }}>
                        {leave.leaveType} Leave
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      📅 Duration: <strong>{new Date(leave.startDate).toLocaleDateString()}</strong> to <strong>{new Date(leave.endDate).toLocaleDateString()}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {getStatusBadge(leave.status)}
                  </div>
                </div>

                {/* Reason */}
                <p style={{ fontSize: '0.9rem', color: '#e5e7eb', lineHeight: 1.5, background: 'rgba(0, 0, 0, 0.2)', padding: '10px 14px', borderRadius: '8px' }}>
                  <strong>Applicant Reason:</strong> {leave.reason}
                </p>

                {/* AI Recommendation Intelligence Card */}
                {leave.aiRecommendation && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${aiBadge.border}`,
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color="#818cf8" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc' }}>
                          AI Recommendation Agent Intelligence
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: aiBadge.bg,
                        color: aiBadge.color,
                        border: `1px solid ${aiBadge.border}`
                      }}>
                        RECOMMENDATION: {leave.aiRecommendation.recommendedStatus?.toUpperCase()}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#f3f4f6', lineHeight: 1.4 }}>
                      {leave.aiRecommendation.reasoning}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '6px' }}>
                      <span>📊 Attendance Evaluation: {leave.aiRecommendation.attendanceImpact}</span>
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>
                        🔒 Concerned Authority: {leave.applicant?.department || 'CSE'} HOD / Faculty
                      </span>
                    </div>
                  </div>
                )}

                {/* Reviewed Audit Details (for History tab) */}
                {activeTab === 'history' && leave.reviewedBy && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#34d399" />
                    <span>Reviewed by <strong>{leave.reviewedBy.name}</strong> ({leave.reviewedBy.designation || leave.reviewedBy.role}) on {new Date(leave.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}

                {/* 1-Click Action Buttons */}
                {activeTab === 'pending' && leave.status === 'Pending' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: authorized ? '#34d399' : '#f43f5e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {authorized ? (
                        <>
                          <CheckCircle2 size={14} color="#34d399" />
                          <span>Authorized Concerned Department Reviewer</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={14} color="#f43f5e" />
                          <span>Restricted: Must be {leave.applicant?.department || 'CSE'} Department Authority</span>
                        </>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => handleReviewLeave(leave._id, 'Rejected')} 
                        className="btn btn-secondary" 
                        disabled={!authorized}
                        style={{ padding: '6px 16px', fontSize: '0.85rem', color: '#f43f5e', opacity: authorized ? 1 : 0.5 }}
                      >
                        <XCircle size={16} /> Reject Leave
                      </button>
                      <button 
                        onClick={() => handleReviewLeave(leave._id, 'Approved')} 
                        className="btn btn-primary" 
                        disabled={!authorized}
                        style={{ padding: '6px 16px', fontSize: '0.85rem', opacity: authorized ? 1 : 0.5 }}
                      >
                        <CheckCircle2 size={16} /> Approve Leave
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
