import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Sparkles, Clock, BookOpen, Layers, 
  AlertTriangle, RefreshCw, Bot, ChevronRight, UserCheck, CheckCircle2 
} from 'lucide-react';
import { LoadingState, EmptyState, ErrorState } from '../components/StateFeedback';

export const FacultyWorkloadPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkloadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/faculty-workload', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch workload distribution');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Header */}
      <div className="glass-panel" style={{ padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.15 }}>
          <Briefcase size={180} color="#818cf8" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge-role badge-hod">
                <Briefcase size={12} /> Workload Governance
              </span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                AICTE / NBA Teaching Load Standards
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Faculty Workload Distribution
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px', maxWidth: '650px' }}>
              Monitor weekly teaching hours, course/lab distributions, and automated AI load-balancing recommendations.
            </p>
          </div>

          <button
            onClick={fetchWorkloadData}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Metrics
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading faculty workload analytics & teaching distributions..." />
      ) : error ? (
        <ErrorState
          title="Unable to load faculty workloads"
          description={error || "The workload analytics service isn't responding right now."}
          onRetry={fetchWorkloadData}
        />
      ) : (
        <>
          {/* AI Recommendation Alert Banner */}
      {data?.aiRecommendation && (
        <div className="glass-panel animate-fade-in-up" style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(245, 158, 11, 0.12) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Sparkles size={20} color="#f59e0b" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fde68a', margin: '0 0 4px 0' }}>
              AI Governance Recommendation
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
              {data.aiRecommendation}
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-secretary', { state: { initialQuery: 'Balance faculty workloads and reallocate courses' } })}
            className="btn btn-primary"
            style={{
              padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px',
              whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            }}
          >
            <Bot size={14} /> Rebalance via AI
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Total Department Faculty</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: '6px 0' }}>
            {data?.totalFaculty || 4}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399' }}>● Active Teaching Roster</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Average Weekly Load</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8', margin: '6px 0' }}>
            {data?.averageWorkloadHours || 16.5} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>hrs/wk</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>AICTE Target: 16–18 hrs/wk</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Maximum Norm Capacity</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', margin: '6px 0' }}>
            20.0 <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>hrs/wk</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>NBA Compliance Threshold</div>
        </div>
      </div>

      {/* Faculty Cards Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {data?.workloads?.map((faculty, idx) => {
          const pct = Math.min(100, Math.round((faculty.workloadHours / faculty.maxNormHours) * 100));
          const isOverloaded = faculty.workloadHours > 18.0;
          const isUnderloaded = faculty.workloadHours < 14.0;

          return (
            <div key={idx} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Faculty Info Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {faculty.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginTop: '2px' }}>
                    {faculty.designation}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                    {faculty.specialization}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isOverloaded ? '#f43f5e' : isUnderloaded ? '#fbbf24' : '#34d399' }}>
                    {faculty.workloadHours} <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>hrs/wk</span>
                  </div>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                    background: isOverloaded ? 'rgba(244,63,94,0.15)' : isUnderloaded ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
                    color: isOverloaded ? '#f43f5e' : isUnderloaded ? '#fbbf24' : '#34d399',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {isOverloaded ? 'Heavy Load' : isUnderloaded ? 'Underutilized' : 'Optimal Load'}
                  </span>
                </div>
              </div>

              {/* Progress Bar Visualization */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Capacity Utilization</span>
                  <span>{pct}% of 20 hrs norm</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: '10px',
                    background: isOverloaded ? 'linear-gradient(90deg, #f43f5e 0%, #fbbf24 100%)' : 'linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Course & Lab Pills */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  flex: 1, padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <BookOpen size={16} color="#818cf8" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Courses</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{faculty.coursesCount}</div>
                  </div>
                </div>

                <div style={{
                  flex: 1, padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <Layers size={16} color="#34d399" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Practicals / Labs</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{faculty.labsCount}</div>
                  </div>
                </div>
              </div>

              {/* Assigned Subjects Badges */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '8px' }}>
                  Assigned Teaching Modules:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {faculty.coursesAssigned?.map((c, cIdx) => (
                    <span key={cIdx} style={{
                      fontSize: '0.72rem', padding: '4px 10px', borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
                      color: '#a5b4fc', fontWeight: 600
                    }}>
                      {c.code}: {c.title} ({c.credits} cr)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
};
