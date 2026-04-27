import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import { taskAPI, dataAPI, assignAPI } from '../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [taskData, analyticData] = await Promise.all([
        taskAPI.list(),
        dataAPI.analytics(),
      ]);
      setTasks(taskData.tasks || []);
      setAnalytics(analyticData);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async (taskId) => {
    try {
      const matchData = await assignAPI.match(taskId);
      setMatchModal(matchData);
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmAssign = async (taskId, volunteerId) => {
    try {
      await assignAPI.assign({ taskId, volunteerId });
      setMatchModal(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const s = analytics?.summary || {};
  const recentTasks = tasks.slice(0, 6);

  if (loading) return <DashboardLayout><div className="loading-spinner"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div id="admin-dashboard">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1>Admin Dashboard</h1>
              <p>Overview of tasks, volunteers, and community needs</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/admin/tasks/new" className="btn btn-primary">➕ Create Task</Link>
              <Link to="/admin/data" className="btn btn-secondary">📂 Upload Data</Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <StatCard icon="📋" label="Total Tasks" value={s.totalTasks || 0} color="blue" />
          <StatCard icon="👥" label="Volunteers" value={s.totalVolunteers || 0} color="green" />
          <StatCard icon="🔴" label="High Urgency" value={s.highUrgencyTasks || 0} color="red" />
          <StatCard icon="✅" label="Completed" value={s.completedTasks || 0} color="purple" />
        </div>

        {/* Quick Stats Row */}
        <div className="grid-3" style={{ marginBottom: 28 }}>
          <div className="card">
            <h4 style={{ marginBottom: 12 }}>📊 Tasks by Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(analytics?.tasksByStatus || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${k}`}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 12 }}>🏷️ Tasks by Category</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(analytics?.tasksByCategory || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${k}`}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 12 }}>📍 Tasks by Location</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(analytics?.tasksByLocation || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text)' }}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>📋 Recent Tasks</h3>
            <Link to="/admin/tasks" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          <div className="grid-2">
            {recentTasks.map(task => (
              <TaskCard key={task.id} task={task} showActions onAssign={handleAutoAssign} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 style={{ marginBottom: 16 }}>⚡ Quick Actions</h3>
          <div className="grid-3">
            <Link to="/admin/tasks/new" className="card" style={{ textAlign: 'center', textDecoration: 'none' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>➕</div>
              <h4>Create New Task</h4>
              <p className="text-sm">Add a new community task</p>
            </Link>
            <Link to="/admin/volunteers" className="card" style={{ textAlign: 'center', textDecoration: 'none' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>👥</div>
              <h4>View Volunteers</h4>
              <p className="text-sm">Browse & manage volunteers</p>
            </Link>
            <Link to="/admin/analytics" className="card" style={{ textAlign: 'center', textDecoration: 'none' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📈</div>
              <h4>Analytics</h4>
              <p className="text-sm">View detailed insights</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Match Modal */}
      {matchModal && (
        <div className="modal-overlay" onClick={() => setMatchModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>🤝 Smart Match Results</h3>
                <p className="text-sm text-light">For: {matchModal.task?.title}</p>
              </div>
              <button className="modal-close" onClick={() => setMatchModal(null)}>✕</button>
            </div>

            {matchModal.allCandidates?.length > 0 ? (
              <div>
                {matchModal.allCandidates.map((c, i) => (
                  <div key={c.userId} className={`match-card ${i === 0 ? 'best' : ''}`}
                    onClick={() => confirmAssign(matchModal.task.id, c.userId)}>
                    <div className="match-score" style={{
                      background: c.scores.total >= 70 ? '#dcfce7' : c.scores.total >= 40 ? '#fef9c3' : '#fee2e2',
                      color: c.scores.total >= 70 ? '#16a34a' : c.scores.total >= 40 ? '#ca8a04' : '#dc2626',
                    }}>
                      {c.scores.total}%
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>
                        {c.name} {i === 0 && <span className="badge badge-completed" style={{ marginLeft: 8 }}>Best Match</span>}
                        {c.isBusy && <span className="badge badge-pending" style={{ marginLeft: 8 }}>Busy</span>}
                      </div>
                      <div className="text-sm text-light" style={{ marginTop: 4 }}>
                        📍 {c.location} · 🎯 {c.skills.join(', ')} · 🕐 {c.availability}
                      </div>
                      <div className="text-xs text-light" style={{ marginTop: 4 }}>
                        Skill: {c.scores.skill}% · Location: {c.scores.location}% · Availability: {c.scores.availability}%
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-light" style={{ marginTop: 12 }}>Click a volunteer to assign them.</p>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">😕</div>
                <h3>No Matches Found</h3>
                <p>No volunteers available for this task.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
