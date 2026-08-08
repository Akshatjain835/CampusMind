import React from 'react';
import { DepartmentAnalytics } from '../components/DepartmentAnalytics';
import { BarChart3, TrendingUp, Sparkles, Users, AlertTriangle } from 'lucide-react';

export const AnalyticsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Executive Department Analytics</h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Real-time attendance trends, faculty workload distributions, and NAAC/NBA metrics</p>
      </div>

      <DepartmentAnalytics />
    </div>
  );
};
