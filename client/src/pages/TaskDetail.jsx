import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { taskAPI, assignAPI } from '../services/api';

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState(null);

  useEffect(() => { loadTask(); }, [id]);

  const loadTask = async () => {
    try {
      const data = await taskAPI.get(id);
      setTask(data.task);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    try {
      const data = await assignAPI.match(id);
      setMatchModal(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmAssign = async (volunteerId) => {
    try {
      await assignAPI.assign({ taskId: id, volunteerId });
      setMatchModal(null);
      loadTask();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAutoAssign = async () => {
    try {
      await assignAPI.assign({ taskId: id, autoMatch: true });
      loadTask();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await taskAPI.update(id, { status });
      loadTask();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(id);
      navigate(user.role === 'admin' ? '/admin/tasks' : '/volunteer');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <DashboardLayout><div className="loading-spinner"><div className="spinner" /></div></DashboardLayout>;
  if (!task) return <DashboardLayout><div className="empty-state"><h3>Task not found</h3></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div id="task-detail" style={{ maxWidth: 800 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          ← Back
        </button>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span className={`badge badge-${task.urgency}`}>{task.urgency} urgency</span>
                <span className={`badge badge-${task.status}`}>{task.status}</span>
                <span className={`badge badge-${task.category}`}>{task.category}</span>
              </div>
              <h1 style={{ fontSize: '1.5rem' }}>{task.title}</h1>
            </div>
          </div>

          <p style={{ color: 'var(--text)', lineHeight: 1.8, marginBottom: 24 }}>{task.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ background: 'var(--gray-50)', border: 'none', padding: 16 }}>
              <div className="text-xs text-light" style={{ marginBottom: 4 }}>📍 Location</div>
              <div style={{ fontWeight: 600 }}>{task.location}</div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: 'none', padding: 16 }}>
              <div className="text-xs text-light" style={{ marginBottom: 4 }}>📅 Created</div>
              <div style={{ fontWeight: 600 }}>{new Date(task.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: 'none', padding: 16 }}>
              <div className="text-xs text-light" style={{ marginBottom: 4 }}>👤 Created By</div>
              <div style={{ fontWeight: 600 }}>{task.createdByName}</div>
            </div>
          </div>

          {/* Required Skills */}
          {task.requiredSkills?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 8 }}>Required Skills</h4>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {task.requiredSkills.map(s => (
                  <span key={s} className="badge badge-assigned">{s.replace('_', ' ')}</span>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Volunteer */}
          {task.assignedVolunteer && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 8 }}>Assigned Volunteer</h4>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
                <div className="navbar-avatar">{task.assignedVolunteer.name?.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{task.assignedVolunteer.name}</div>
                  <div className="text-sm text-light">{task.assignedVolunteer.email}</div>
                  {task.assignedVolunteer.profile && (
                    <div className="text-xs text-light" style={{ marginTop: 4 }}>
                      📍 {task.assignedVolunteer.profile.location} · 🎯 {task.assignedVolunteer.profile.skills?.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {user?.role === 'admin' && task.status === 'pending' && (
              <>
                <button className="btn btn-primary" onClick={handleAutoAssign}>⚡ Auto-Assign Best Match</button>
                <button className="btn btn-secondary" onClick={handleAssign}>🤝 View Matches</button>
              </>
            )}
            {user?.role === 'volunteer' && task.status === 'assigned' && task.assignedVolunteerId === user.id && (
              <button className="btn btn-success" onClick={() => handleStatusUpdate('completed')}>✅ Mark Completed</button>
            )}
            {user?.role === 'admin' && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ Delete</button>
            )}
          </div>
        </div>
      </div>

      {/* Match Modal */}
      {matchModal && (
        <div className="modal-overlay" onClick={() => setMatchModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤝 Volunteer Matches</h3>
              <button className="modal-close" onClick={() => setMatchModal(null)}>✕</button>
            </div>
            {matchModal.allCandidates?.map((c, i) => (
              <div key={c.userId} className={`match-card ${i === 0 ? 'best' : ''}`}
                onClick={() => confirmAssign(c.userId)}>
                <div className="match-score" style={{
                  background: c.scores.total >= 70 ? '#dcfce7' : '#fef9c3',
                  color: c.scores.total >= 70 ? '#16a34a' : '#ca8a04',
                }}>{c.scores.total}%</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{c.name} {i === 0 && '⭐'}</div>
                  <div className="text-sm text-light">📍 {c.location} · {c.skills.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
