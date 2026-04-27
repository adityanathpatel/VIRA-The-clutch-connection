import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { dataAPI } from '../services/api';

const BAR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9', '#f97316'];

function BarChart({ title, data, colors = BAR_COLORS }) {
  const maxVal = Math.max(...Object.values(data), 1);
  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div className="bar-chart">
        {Object.entries(data).map(([label, value], i) => (
          <div key={label} className="bar-item">
            <div className="bar" style={{
              height: `${(value / maxVal) * 100}%`,
              background: colors[i % colors.length],
            }}>
              <span className="bar-value">{value}</span>
            </div>
            <span className="bar-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ title, data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  let cumulative = 0;

  const gradientParts = Object.entries(data).map(([, value], i) => {
    const start = (cumulative / total) * 360;
    cumulative += value;
    const end = (cumulative / total) * 360;
    return `${colors[i % colors.length]} ${start}deg ${end}deg`;
  });

  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div className="donut-chart" style={{
        background: `conic-gradient(${gradientParts.join(', ')})`,
      }}>
        <div className="donut-center" style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'var(--bg-card)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>{total}</div>
      </div>
      <div className="donut-legend">
        {Object.entries(data).map(([label, value], i) => (
          <div key={label} className="donut-legend-item">
            <div className="donut-legend-color" style={{ background: colors[i % colors.length] }} />
            <span style={{ flex: 1, textTransform: 'capitalize' }}>{label}</span>
            <strong>{value}</strong>
            <span className="text-xs text-light" style={{ marginLeft: 4 }}>({total > 0 ? Math.round(value / total * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataAPI.analytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="loading-spinner"><div className="spinner" /></div></DashboardLayout>;
  if (!data) return <DashboardLayout><div className="empty-state"><h3>Failed to load analytics</h3></div></DashboardLayout>;

  const s = data.summary;

  return (
    <DashboardLayout>
      <div id="analytics-page">
        <div className="page-header">
          <h1>Analytics Dashboard</h1>
          <p>Insights into community needs, volunteer activity, and task distribution</p>
        </div>

        {/* Summary Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <StatCard icon="📋" label="Total Tasks" value={s.totalTasks} color="blue" />
          <StatCard icon="👥" label="Total Volunteers" value={s.totalVolunteers} color="green" />
          <StatCard icon="📊" label="Data Reports" value={s.totalReports} color="purple" />
          <StatCard icon="✅" label="Completed Tasks" value={s.completedTasks} color="orange" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <BarChart title="📊 Tasks by Category" data={data.tasksByCategory} />
          <DonutChart title="🎯 Tasks by Status" data={data.tasksByStatus} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <BarChart title="⚠️ Tasks by Urgency" data={data.tasksByUrgency}
            colors={['#ef4444', '#f59e0b', '#10b981']} />
          <BarChart title="📍 Tasks by Location" data={data.tasksByLocation} />
        </div>

        {/* Charts Row 3 */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <DonutChart title="👥 Volunteers by Location" data={data.volunteersByLocation} />
          <BarChart title="🎯 Skills Distribution" data={data.skillsDistribution} />
        </div>

        {/* Key Insights */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>💡 Key Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="card" style={{ background: '#fef2f2', border: 'none', padding: 16 }}>
              <h4 style={{ color: '#dc2626', marginBottom: 4 }}>🔴 Urgent Attention</h4>
              <p className="text-sm">{s.highUrgencyTasks} high-urgency tasks need immediate volunteer assignment.</p>
            </div>
            <div className="card" style={{ background: '#eff6ff', border: 'none', padding: 16 }}>
              <h4 style={{ color: '#2563eb', marginBottom: 4 }}>📋 Pending Tasks</h4>
              <p className="text-sm">{s.pendingTasks} tasks are still pending and awaiting volunteer assignment.</p>
            </div>
            <div className="card" style={{ background: '#f0fdf4', border: 'none', padding: 16 }}>
              <h4 style={{ color: '#16a34a', marginBottom: 4 }}>✅ Completion Rate</h4>
              <p className="text-sm">{s.totalTasks > 0 ? Math.round(s.completedTasks / s.totalTasks * 100) : 0}% of tasks have been successfully completed.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
