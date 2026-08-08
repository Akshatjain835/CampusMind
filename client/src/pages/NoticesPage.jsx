import React, { useState } from 'react';
import { NoticeBoard } from '../components/NoticeBoard';
import { NoticeGeneratorModal } from '../components/NoticeGeneratorModal';
import { Bell, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NoticesPage = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Department Circulars & Notices</h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Official circulars, exam notices, and workshop announcements</p>
        </div>

        {user?.role !== 'student' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            <Sparkles size={18} /> Generate Notice with AI
          </button>
        )}
      </div>

      <NoticeBoard />

      <NoticeGeneratorModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};
