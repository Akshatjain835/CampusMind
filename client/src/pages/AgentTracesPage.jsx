import React from 'react';
import { GitBranch, CheckCircle2, Clock, Sparkles, Activity } from 'lucide-react';

export const AgentTracesPage = () => {
  const sampleTraces = [
    {
      id: 'TRC-9021',
      query: 'Can I take 5 days of medical leave next week, and if yes, what will happen to my attendance and exam eligibility?',
      timestamp: 'Just now',
      duration: '1.2s',
      status: 'Completed',
      agentChain: ['Long-Term Memory Store', 'Planner Agent', 'Attendance Agent', 'Regulation RAG Agent', 'Leave Agent', 'Analytics Agent', 'Multi-Agent Negotiation Agent', 'Reflection Agent', 'Critic Agent', 'Response Generator']
    },
    {
      id: 'TRC-9018',
      query: 'Generate a conflict-free weekly timetable for 6th Semester CSE Section A',
      timestamp: '12 mins ago',
      duration: '0.8s',
      status: 'Completed',
      agentChain: ['Planner Agent', 'Timetable Agent', 'Faculty Agent', 'Critic Agent', 'Response Generator']
    },
    {
      id: 'TRC-9014',
      query: 'Retrieve NAAC Criterion 2 faculty workload standards and publication requirements',
      timestamp: '45 mins ago',
      duration: '0.6s',
      status: 'Completed',
      agentChain: ['Planner Agent', 'Regulation RAG Agent', 'Faculty Agent', 'Response Generator']
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>LangGraph Multi-Agent Execution Traces</h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Live audit logs of multi-agent state graph execution trajectories and subtask DAGs</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sampleTraces.map((trace, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#a855f7', padding: '4px 10px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.12)' }}>
                  {trace.id}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {trace.timestamp} ({trace.duration})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>
                <CheckCircle2 size={16} /> {trace.status}
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              "{trace.query}"
            </p>

            {/* Visual Agent Chain Pill Flow */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Executed Agent Chain Trajectory ({trace.agentChain.length} Nodes)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {trace.agentChain.map((node, nIdx) => (
                  <React.Fragment key={nIdx}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(129, 140, 248, 0.3)',
                      color: '#a5b4fc'
                    }}>
                      {node}
                    </span>
                    {nIdx < trace.agentChain.length - 1 && (
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>➔</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
