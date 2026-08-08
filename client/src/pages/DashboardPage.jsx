import React from 'react';
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

      {/* Role-Specific Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {isStudent ? (
          <>
            <NavLink to="/attendance" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Overall Attendance</span>
                  <Calendar size={22} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>84.5%</div>
                <div style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> Above 75% Mandatory Threshold
                </div>
              </div>
            </NavLink>

            <NavLink to="/courses" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Enrolled Courses</span>
                  <BookOpen size={22} color="#a855f7" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>6</div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>6th Semester CSE Section A</div>
              </div>
            </NavLink>

            <NavLink to="/leaves" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Leave Requests</span>
                  <FileText size={22} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>1 Pending</div>
                <div style={{ fontSize: '0.78rem', color: '#fbbf24' }}>Medical Leave (Condonation Check)</div>
              </div>
            </NavLink>

            <NavLink to="/notices" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Unread Circulars</span>
                  <Bell size={22} color="#f43f5e" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>3 Unread</div>
                <div style={{ fontSize: '0.78rem', color: '#f43f5e' }}>Mid-Sem Exam Eligibility Notice</div>
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
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>24</div>
                <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>18.5 hrs/week avg workload</div>
              </div>
            </NavLink>

            <NavLink to="/approvals" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Pending HITL Approvals</span>
                  <AlertTriangle size={22} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>4 Sanctions</div>
                <div style={{ fontSize: '0.78rem', color: '#fbbf24' }}>Requires HOD Authorization</div>
              </div>
            </NavLink>

            <NavLink to="/attendance" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Attendance Risk</span>
                  <AlertTriangle size={22} color="#f43f5e" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>12 Students</div>
                <div style={{ fontSize: '0.78rem', color: '#f43f5e' }}>Below 75% Threshold</div>
              </div>
            </NavLink>

            <NavLink to="/analytics" style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-glow" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Pass Rate Target</span>
                  <CheckCircle2 size={22} color="#34d399" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>91.2%</div>
                <div style={{ fontSize: '0.78rem', color: '#34d399' }}>NAAC Criterion 2 Compliant</div>
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
            <div style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: 'rgba(56, 189, 248, 0.08)',
              borderLeft: '4px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>CS601 Compiler Design</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Prof. Rajesh Kumar • Room 302</div>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>09:00 - 10:00 AM</span>
            </div>

            <div style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: 'rgba(168, 85, 247, 0.08)',
              borderLeft: '4px solid #a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>CS603 AI & ML Lab</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Dr. Ananya Verma • Compute Lab 4</div>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a855f7' }}>11:00 - 01:00 PM</span>
            </div>

            <div style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: 'rgba(52, 211, 153, 0.08)',
              borderLeft: '4px solid #34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>CS602 Computer Networks</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Prof. Mehta • Hall B</div>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>02:00 - 03:00 PM</span>
            </div>
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
              <strong style={{ color: '#facc15' }}>Attendance Risk Warning:</strong> Taking 5 days of medical leave will reduce projected attendance in <em>Computer Networks</em> to <strong>71.5%</strong>. HOD condonation sanction required under Clause 1.2.
            </div>

            <div style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              fontSize: '0.88rem',
              lineHeight: 1.5
            }}>
              <strong style={{ color: '#818cf8' }}>Examination Notice:</strong> Mid-Semester exam attendance verification commences next Monday. Ensure medical condonation forms are filed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
