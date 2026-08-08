import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NoticeGeneratorModal } from './NoticeGeneratorModal';
import { LoadingState, EmptyState } from './StateFeedback';
import { 
  FileText, Sparkles, Plus, Calendar, Tag, 
  Trash2, User, ChevronDown, ChevronUp, Bell, CheckCircle2 
} from 'lucide-react';

export const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotices(data);
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/notices/${noticeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchNotices();
    } catch (err) {
      console.error('Failed to delete notice:', err);
    }
  };

  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case 'Exam':
        return { bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.3)' };
      case 'Urgent':
        return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' };
      case 'Workshop':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
      default:
        return { bg: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: 'rgba(192, 132, 252, 0.3)' };
    }
  };

  const filteredNotices = notices.filter(n => 
    filterCategory === 'all' || n.category?.toLowerCase() === filterCategory.toLowerCase()
  );

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px', marginBottom: '32px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Bell size={22} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Department Circulars & Notice Board</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Official announcements for <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{user?.department || 'Computer Science & Engineering'}</span>
          </p>
        </div>

        {(user?.role === 'hod' || user?.role === 'admin' || user?.role === 'faculty') && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} /> Generate AI Notice
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['all', 'Academic', 'Exam', 'Workshop', 'Urgent'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background: filterCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
              color: filterCategory === cat ? '#fff' : 'var(--text-dim)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {cat === 'all' ? 'All Notices' : cat}
          </button>
        ))}
      </div>

      {/* Notice Cards Grid */}
      {loading ? (
        <LoadingState message="Loading department circulars & notices..." />
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          title="No official notices published"
          description="✓ All clear! Official department circulars, workshop schedules, and exam notices will appear here."
          icon={CheckCircle2}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredNotices.map((notice) => {
            const badge = getCategoryBadgeStyle(notice.category);
            const isExpanded = expandedNoticeId === notice._id;

            return (
              <div 
                key={notice._id} 
                className="glass-card animate-fade-in" 
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: `4px solid ${badge.color}` }}
              >
                {/* Notice Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 800, 
                        padding: '2px 10px', 
                        borderRadius: '12px', 
                        background: badge.bg, 
                        color: badge.color, 
                        border: `1px solid ${badge.border}` 
                      }}>
                        {notice.category?.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>
                        {notice.circularNumber}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => setExpandedNoticeId(isExpanded ? null : notice._id)}>
                      {notice.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                      <div>📅 {new Date(notice.createdAt).toLocaleDateString()}</div>
                      <div>By {notice.authorName || 'HOD'}</div>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'hod' || notice.author === user?._id) && (
                      <button 
                        onClick={() => handleDeleteNotice(notice._id)} 
                        style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                        title="Delete Notice"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Preview / Full Text */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: '0.85rem',
                  color: '#e5e7eb',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  fontFamily: isExpanded ? 'monospace' : 'inherit',
                  maxHeight: isExpanded ? 'none' : '100px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {notice.content}
                </div>

                {/* Expand / Collapse Button */}
                <button
                  onClick={() => setExpandedNoticeId(isExpanded ? null : notice._id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    alignSelf: 'flex-start'
                  }}
                >
                  {isExpanded ? (
                    <>Collapse Circular <ChevronUp size={14} /></>
                  ) : (
                    <>Read Full Circular <ChevronDown size={14} /></>
                  )}
                </button>

              </div>
            );
          })}
        </div>
      )}

      {/* Notice Generator Modal */}
      <NoticeGeneratorModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onNoticePublished={fetchNotices} 
      />

    </div>
  );
};
