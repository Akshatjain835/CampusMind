import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, Users, Clock, Award, Sparkles, 
  Download, BookOpen, AlertTriangle, CheckCircle2, 
  BarChart3, Layers, FileSpreadsheet, RefreshCw 
} from 'lucide-react';

export const DepartmentAnalytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/kpi', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleGenerateAiSummary = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok) setAiSummary(result);
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!data) return;
    const kpis = data.kpis;
    const csvContent = [
      ['Metric', 'Value'],
      ['Department', data.department],
      ['Overall Attendance Rate', `${kpis.overallAttendanceRate}%`],
      ['Faculty Workload Average', `${kpis.avgFacultyWorkloadHours} Hrs/Wk`],
      ['NAAC Readiness Score', `${kpis.naacReadinessScore}%`],
      ['Research Publications', kpis.researchPublicationsPublished],
      ['Active Research Grants', kpis.activeResearchGrants],
      ['Total Students', kpis.totalStudents],
      ['Total Faculty', kpis.totalFaculty]
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${data.department}_Analytics_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading department performance analytics & real-time metrics...
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px', marginBottom: '32px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <BarChart3 size={24} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Department Performance Analytics</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time KPIs, Workload Metrics, and NAAC/NBA Compliance for <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{user?.department || 'Computer Science & Engineering'}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={16} /> Export CSV Report
          </button>

          <button onClick={handleGenerateAiSummary} className="btn btn-primary" disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} /> {aiLoading ? 'Analyzing Metrics...' : 'Generate AI Executive Insights'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Attendance Rate</span>
            <TrendingUp size={20} color="#34d399" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {kpis.overallAttendanceRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
            {kpis.attendanceTrend}
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Faculty Workload</span>
            <Clock size={20} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {kpis.avgFacultyWorkloadHours} Hrs/Wk
          </div>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            {kpis.workloadStatus}
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NAAC/NBA Readiness</span>
            <Award size={20} color="#c084fc" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
            {kpis.naacReadinessScore}%
          </div>
          <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600 }}>
            {kpis.nbaComplianceStatus}
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Research Publications</span>
            <BookOpen size={20} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
            {kpis.researchPapersPublished} Papers
          </div>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Grants: {kpis.activeResearchGrants}
          </span>
        </div>

      </div>

      {/* AI Executive Summary Card */}
      {aiSummary && (
        <div className="animate-fade-in" style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(129, 140, 248, 0.35)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Sparkles size={20} color="#818cf8" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#a5b4fc' }}>
              AI Executive Performance Insights (LangChain Agent)
            </h4>
          </div>
          <div style={{
            whiteSpace: 'pre-wrap',
            fontSize: '0.88rem',
            color: '#f3f4f6',
            lineHeight: 1.6,
            fontFamily: 'monospace',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '14px',
            borderRadius: '8px'
          }}>
            {aiSummary.summary}
          </div>
        </div>
      )}

      {/* Semester Attendance & Faculty Workload Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Semester Attendance Progress Meters */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--accent-emerald)" /> Semester Attendance Rates
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data?.semesterAttendance?.map((item) => (
              <div key={item.semester}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span><strong>{item.semester}</strong></span>
                  <span style={{ color: item.attendance >= 80 ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                    {item.attendance}% ({item.defaulters} Defaulters)
                  </span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${item.attendance}%`,
                    background: item.attendance >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    height: '100%',
                    borderRadius: '10px',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NAAC / NBA Compliance Status */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--accent-purple)" /> NAAC / NBA Criteria Audit
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.naacCriteriaStatus?.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#e5e7eb' }}>{item.criteria}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Audit Readiness: {item.score}%</div>
                </div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: item.status === 'Audited' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                  color: item.status === 'Audited' ? '#34d399' : '#fbbf24',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {item.status?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Faculty Workload & Subject Allocation Table */}
      <div className="glass-card">
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--accent-cyan)" /> Faculty Workload & Subject Distribution
        </h4>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Faculty Member</th>
                <th style={{ padding: '10px' }}>Assigned Subjects</th>
                <th style={{ padding: '10px' }}>Hours / Week</th>
                <th style={{ padding: '10px' }}>Workload Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.facultyWorkloadDistribution?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '10px', fontWeight: 700, color: '#fff' }}>{item.facultyName}</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{item.subjects}</td>
                  <td style={{ padding: '10px', color: 'var(--accent-cyan)', fontWeight: 700 }}>{item.hoursPerWeek} Hrs/Wk</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(52, 211, 153, 0.15)',
                      color: '#34d399',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Optimal Load
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
