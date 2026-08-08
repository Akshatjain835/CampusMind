import React from 'react';
import { FacultyApprovalPortal } from '../components/FacultyApprovalPortal';
import { ShieldCheck, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export const ApprovalsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Human-In-The-Loop (HITL) Approvals Portal</h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Review and sanction student leave condonations, makeup exams, and governance requests</p>
      </div>

      <FacultyApprovalPortal />
    </div>
  );
};
