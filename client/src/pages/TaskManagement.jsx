import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import TaskCard from '../components/TaskCard';
import { taskAPI, assignAPI } from '../services/api';

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', urgency: '', category: '' });
  const [matchModal, setMatchModal] = useState(null);

  useEffect(() => { loadTasks(); }, [filters]);

  const loadTasks = async () => {
    try {
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.urgency)  params.urgency  = filters.urgency;
      if (filters.category) params.category = filters.category;
      const data = await taskAPI.list(params);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
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
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div id="task-management">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1>Task Management</h1>
              <p>{tasks.length} tasks found</p>
            </div>
            <Link to="/admin/tasks/new" className="btn btn-primary">➕ New Task</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filters.urgency} onChange={e => setFilters({ ...filters, urgency: e.target.value })}>
            <option value="">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All Categories</option>
            <option value="health">Health</option>
            <option value="food">Food</option>
            <option value="education">Education</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="welfare">Welfare</option>
            <option value="environment">Environment</option>
          </select>
          {(filters.status || filters.urgency || filters.category) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', urgency: '', category: '' })}>
              ✕ Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : tasks.length > 0 ? (
          <div className="grid-2">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} showActions onAssign={handleAutoAssign} />
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Tasks Found</h3>
            <p>Try adjusting your filters or create a new task.</p>
            <Link to="/admin/tasks/new" className="btn btn-primary">Create Task</Link>
          </div>
        )}
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
                        {c.name} {i === 0 && <span className="badge badge-completed" style={{ marginLeft: 8 }}>Best</span>}
                      </div>
                      <div className="text-sm text-light" style={{ marginTop: 4 }}>
                        📍 {c.location} · 🎯 {c.skills.join(', ')} · 🕐 {c.availability}
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-light" style={{ marginTop: 12 }}>Click to assign.</p>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No Matches</h3>
                <p>No volunteers available.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
