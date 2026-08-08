import React, { useState } from 'react';
import { TimetableGrid } from '../components/TimetableGrid';
import { TimetableGeneratorModal } from '../components/TimetableGeneratorModal';
import { Clock, Sparkles } from 'lucide-react';

export const TimetablePage = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Weekly Class & Lab Timetable</h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Interactive timetable grid and AI conflict-free scheduling engine</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
        >
          <Sparkles size={18} /> Generate Timetable with AI
        </button>
      </div>

      <TimetableGrid />

      <TimetableGeneratorModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};
