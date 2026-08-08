import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  BookOpen,
  FileText,
  Bell,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const isStudent = (user?.role || 'student') === 'student';

  const [kpiData, setKpiData] = useState(null);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [unreadCircularsCount, setUnreadCircularsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const kpiRes = await fetch('/api/analytics/kpi', { headers });
        if (kpiRes.ok) {
          const data = await kpiRes.json();
          setKpiData(data);
        }
      } catch (e) {
        console.error('Failed to fetch KPIs:', e);
      }

      try {
        const ttRes = await fetch(`/api/timetable?semester=${user?.semester || '6th Semester'}&section=${user?.section || 'Section A'}`, { headers });
        if (ttRes.ok) {
          const tt = await ttRes.json();
          setTimetableSlots(tt.slots || []);
        }
      } catch (e) {
        console.error('Failed to fetch timetable:', e);
      }

      try {
        const leavesRes = await fetch('/api/leaves/my-leaves', { headers });
        if (leavesRes.ok) {
          const leaves = await leavesRes.json();
          setPendingLeavesCount(leaves.filter(l => l.status === 'Pending').length);
        }
      } catch (e) {
        console.error('Failed to fetch leaves:', e);
      }

      try {
        const noticesRes = await fetch('/api/notices', { headers });
        if (noticesRes.ok) {
          const notices = await noticesRes.json();
          setUnreadCircularsCount(notices.length);
        }
      } catch (e) {
        console.error('Failed to fetch notices:', e);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  const todaySchedule = timetableSlots.length > 0 ? timetableSlots.slice(0, 3) : [
    { courseCode: 'CS601', courseName: 'Compiler Design', facultyName: 'Prof. Rajesh Kumar', room: 'Room 302', timeSlot: '09:00 - 10:00 AM' },
    { courseCode: 'CS603', courseName: 'AI & ML Lab', facultyName: 'Dr. Ananya Verma', room: 'Compute Lab 4', timeSlot: '11:00 - 01:00 PM' },
    { courseCode: 'CS602', courseName: 'Computer Networks', facultyName: 'Prof. Mehta', room: 'Hall B', timeSlot: '02:00 - 03:00 PM' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
        border: '1px solid rgba(129, 140, 248, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={20} color="#818cf8" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DepartmentAI Command Center
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Welcome back, {user?.name || 'Academic Member'}! 👋
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginTop: '6px', maxWidth: '600px' }}>
            {isStudent 
              ? 'Your semester attendance, course schedules, and academic governance tasks are up-to-date.'
              : 'Department governance, faculty workload distributions, and pending student sanctions.'}
          </p>
        </div>

        <NavLink to="/ai-secretary" className="btn btn-primary" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 24px',
          fontSize: '0.95rem',
          fontWeight: 700
        }}>
          <Sparkles size={18} /> Launch AI Secretary <ArrowRight size={18} />
        </NavLink>
      </div>

      {/* Role-Specific Dynamic Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {isStudent ? (
          <>
            <NavLink to="/attendance" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Overall Attendance</span>
                  <Calendar size={22} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                  {kpiData?.kpis?.overallAttendanceRate || 84.5}%
                </div>
                <div style={{ fontSize: '0.78rem', color: (kpiData?.kpis?.overallAttendanceRate || 84.5) >= 75 ? '#34d399' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> {(kpiData?.kpis?.overallAttendanceRate || 84.5) >= 75 ? 'Above 75% Mandatory Threshold' : 'Attention: Below Threshold'}
                </div>
              </div>
            </NavLink>

            <NavLink to="/courses" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Enrolled Courses</span>
                  <BookOpen size={22} color="#a855f7" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>5</div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{user?.semester || '6th Semester'} {user?.department || 'CSE'}</div>
              </div>
            </NavLink>

            <NavLink to="/leaves" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Leave Requests</span>
                  <FileText size={22} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>{pendingLeavesCount} Pending</div>
                <div style={{ fontSize: '0.78rem', color: '#fbbf24' }}>AI Condonation Evaluation Active</div>
              </div>
            </NavLink>

            <NavLink to="/notices" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Circulars</span>
                  <Bell size={22} color="#f43f5e" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>{unreadCircularsCount} Active</div>
                <div style={{ fontSize: '0.78rem', color: '#f43f5e' }}>Academic Notices & Guidelines</div>
              </div>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/analytics" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Department Faculty</span>
                  <Users size={22} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                  {kpiData?.kpis?.totalFaculty || 6}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                  {kpiData?.kpis?.avgFacultyWorkloadHours || 18} hrs/week avg workload
                </div>
              </div>
            </NavLink>

            <NavLink to="/approvals" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Pending Approvals</span>
                  <AlertTriangle size={22} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                  {kpiData?.kpis?.pendingApprovalsCount || 0} Requests
                </div>
                <div style={{ fontSize: '0.78rem', color: '#fbbf24' }}>Requires HOD Authorization</div>
              </div>
            </NavLink>

            <NavLink to="/attendance" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Dept Attendance Rate</span>
                  <AlertTriangle size={22} color="#f43f5e" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                  {kpiData?.kpis?.overallAttendanceRate || 84.2}%
                </div>
                <div style={{ fontSize: '0.78rem', color: '#f43f5e' }}>Live Computed Average</div>
              </div>
            </NavLink>

            <NavLink to="/analytics" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>NAAC Readiness</span>
                  <CheckCircle2 size={22} color="#34d399" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                  {kpiData?.kpis?.naacReadinessScore || 88}%
                </div>
                <div style={{ fontSize: '0.78rem', color: '#34d399' }}>NBA Compliance Auditor Active</div>
              </div>
            </NavLink>
          </>
        )}
      </div>

      {/* Today's Schedule & AI Insights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Today's Schedule */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#38bdf8" /> Today's Lecture Schedule
            </h3>
            <NavLink to="/timetable" style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
              View Timetable →
            </NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todaySchedule.map((slot, idx) => (
              <div key={idx} style={{
                padding: '14px 18px',
                borderRadius: '14px',
                background: idx % 2 === 0 ? 'rgba(56, 189, 248, 0.08)' : 'rgba(168, 85, 247, 0.08)',
                borderLeft: `4px solid ${idx % 2 === 0 ? '#38bdf8' : '#a855f7'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{slot.courseCode || slot.code} {slot.courseName || slot.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{slot.facultyName || slot.faculty} • {slot.room}</div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: idx % 2 === 0 ? '#38bdf8' : '#a855f7' }}>{slot.timeSlot}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Predictive Governance Insights */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#a855f7" /> AI Governance Insights
            </h3>
            <NavLink to="/ai-secretary" style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
              Ask AI →
            </NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              fontSize: '0.88rem',
              lineHeight: 1.5
            }}>
              <strong style={{ color: '#facc15' }}>Attendance & Risk Monitor:</strong> Overall student attendance computed at <strong>{kpiData?.kpis?.overallAttendanceRate || 84.5}%</strong> across department courses. Clause 1.2 condonation active.
            </div>

            <div style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              fontSize: '0.88rem',
              lineHeight: 1.5
            }}>
              <strong style={{ color: '#818cf8' }}>Accreditation Status:</strong> NAAC Criteria audit readiness score is <strong>{kpiData?.kpis?.naacReadinessScore || 88}%</strong>. All circulars and workload logs updated.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

