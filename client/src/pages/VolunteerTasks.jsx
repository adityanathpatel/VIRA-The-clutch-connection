import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import TaskCard from '../components/TaskCard';
import { taskAPI } from '../services/api';

export default function VolunteerTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('assigned');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const data = await taskAPI.list();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await taskAPI.update(taskId, { status: 'completed' });
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const myTasks = tasks.filter(t => t.assignedVolunteerId === user?.id);
  const assignedTasks = myTasks.filter(t => t.status === 'assigned');
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  const displayTasks = tab === 'assigned' ? assignedTasks : completedTasks;

  if (loading) return <DashboardLayout><div className="loading-spinner"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div id="volunteer-tasks">
        <div className="page-header">
          <h1>My Tasks</h1>
          <p>Manage your assigned and completed tasks</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" style={{ maxWidth: 320, marginBottom: 24 }}>
          <button className={`auth-tab ${tab === 'assigned' ? 'active' : ''}`}
            onClick={() => setTab('assigned')}>
            📌 Assigned ({assignedTasks.length})
          </button>
          <button className={`auth-tab ${tab === 'completed' ? 'active' : ''}`}
            onClick={() => setTab('completed')}>
            ✅ Completed ({completedTasks.length})
          </button>
        </div>

        {displayTasks.length > 0 ? (
          <div className="grid-2">
            {displayTasks.map(task => (
              <TaskCard key={task.id} task={task} showActions
                onComplete={tab === 'assigned' ? handleComplete : undefined} />
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <div className="empty-icon">{tab === 'assigned' ? '📋' : '✅'}</div>
            <h3>No {tab} tasks</h3>
            <p>{tab === 'assigned' ? 'You have no active assignments.' : 'No completed tasks yet.'}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
