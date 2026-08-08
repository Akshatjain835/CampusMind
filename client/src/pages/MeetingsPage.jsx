import React, { useState } from 'react';
import { MeetingScheduler } from '../components/MeetingScheduler';
import { ScheduleMeetingModal } from '../components/ScheduleMeetingModal';
import { Users, Plus, Sparkles } from 'lucide-react';

export const MeetingsPage = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Department Meetings & Governance</h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Schedule committee reviews, faculty meetings, and student advisories</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
        >
          <Sparkles size={18} /> Schedule Meeting with AI
        </button>
      </div>

      <MeetingScheduler />

      <ScheduleMeetingModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};
