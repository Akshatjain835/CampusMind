import React, { useState } from 'react';
import { LeaveManagement } from '../components/LeaveManagement';
import { LeaveModal } from '../components/LeaveModal';
import { FileText, Plus, Sparkles } from 'lucide-react';

export const LeaveManagementPage = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Leave Governance & Management</h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Apply for student/faculty leaves with AI recommendation checks</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
        >
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      {/* Embedded Component */}
      <LeaveManagement />

      {/* Leave Application Modal */}
      <LeaveModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};
