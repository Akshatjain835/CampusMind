import React from 'react';
import { 
  CheckCircle2, AlertTriangle, RefreshCw, Sparkles, 
  Inbox, Loader2, ShieldCheck, XCircle 
} from 'lucide-react';

// 1. Meaningful Loading State Component
export const LoadingState = ({ message = 'Loading system data...' }) => (
  <div className="glass-panel animate-fade-in" style={{
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    textAlign: 'center',
    minHeight: '220px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'rgba(99, 102, 241, 0.12)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Loader2 size={24} color="#818cf8" className="animate-spin" />
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
        {message}
      </h4>
      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
        Connecting to DepartmentAI microservices & database...
      </p>
    </div>

    {/* Micro Dots Pulse */}
    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} className="animate-pulse" />
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', animationDelay: '0.2s' }} className="animate-pulse" />
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', animationDelay: '0.4s' }} className="animate-pulse" />
    </div>
  </div>
);

// 2. Polished Empty State Component
export const EmptyState = ({ 
  title = 'No records found', 
  description = "✓ You're all caught up.", 
  icon: CustomIcon = CheckCircle2,
  actionLabel,
  onAction 
}) => {
  const Icon = CustomIcon;

  return (
    <div className="glass-panel animate-fade-in" style={{
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      textAlign: 'center',
      minHeight: '220px',
      border: '1px border-dashed rgba(255, 255, 255, 0.12)'
    }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        background: 'rgba(52, 211, 153, 0.12)',
        border: '1px solid rgba(52, 211, 153, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={26} color="#34d399" />
      </div>

      <div style={{ maxWidth: '400px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn btn-secondary"
          style={{ marginTop: '8px', padding: '8px 20px', fontSize: '0.85rem' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// 3. Graceful Error & Retry State Component
export const ErrorState = ({ 
  title = 'Unable to load data', 
  description = 'The requested service isn’t responding right now.', 
  onRetry 
}) => (
  <div className="glass-panel animate-fade-in" style={{
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    textAlign: 'center',
    minHeight: '220px',
    background: 'rgba(244, 63, 94, 0.05)',
    border: '1px solid rgba(244, 63, 94, 0.25)'
  }}>
    <div style={{
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      background: 'rgba(244, 63, 94, 0.15)',
      border: '1px solid rgba(244, 63, 94, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <AlertTriangle size={26} color="#f43f5e" />
    </div>

    <div style={{ maxWidth: '420px' }}>
      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
        {description}
      </p>
    </div>

    {onRetry && (
      <button
        onClick={onRetry}
        className="btn btn-primary"
        style={{
          marginTop: '6px',
          padding: '10px 22px',
          fontSize: '0.85rem',
          background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
          boxShadow: '0 4px 15px rgba(244, 63, 94, 0.35)'
        }}
      >
        <RefreshCw size={15} /> Retry Request
      </button>
    )}
  </div>
);
