import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import { taskAPI, volunteerAPI } from '../services/api';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [taskData, notifData] = await Promise.all([
        taskAPI.list(),
        volunteerAPI.notifications(),
      ]);
      setTasks(taskData.tasks || []);
      setNotifications(notifData.notifications || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const myTasks = tasks.filter(t => t.assignedVolunteerId === user?.id);
  const assignedTasks = myTasks.filter(t => t.status === 'assigned');
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  const nearbyTasks = tasks.filter(t =>
    t.status === 'pending' &&
    t.location?.toLowerCase() === user?.profile?.location?.toLowerCase()
  );

  const handleComplete = async (taskId) => {
    try {
      await taskAPI.update(taskId, { status: 'completed' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <DashboardLayout><div className="loading-spinner"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div id="volunteer-dashboard">
        <div className="page-header">
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's your volunteer activity overview</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <StatCard icon="📋" label="Assigned Tasks" value={assignedTasks.length} color="blue" />
          <StatCard icon="✅" label="Completed" value={completedTasks.length} color="green" />
          <StatCard icon="📍" label="Nearby Tasks" value={nearbyTasks.length} color="orange" />
          <StatCard icon="🔔" label="Notifications" value={notifications.filter(n => !n.read).length} color="purple" />
        </div>

        {/* Assigned Tasks */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ marginBottom: 16 }}>📌 Your Assigned Tasks</h3>
          {assignedTasks.length > 0 ? (
            <div className="grid-2">
              {assignedTasks.map(task => (
                <TaskCard key={task.id} task={task} showActions onComplete={handleComplete} />
              ))}
            </div>
          ) : (
            <div className="card empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Assigned Tasks</h3>
              <p>You don't have any active task assignments yet.</p>
            </div>
          )}
        </div>

        {/* Nearby Tasks */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ marginBottom: 16 }}>📍 Tasks Near You ({user?.profile?.location || 'Unknown'})</h3>
          {nearbyTasks.length > 0 ? (
            <div className="grid-2">
              {nearbyTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p>No pending tasks in your area right now. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div>
          <h3 style={{ marginBottom: 16 }}>🔔 Recent Notifications</h3>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {notifications.length > 0 ? notifications.slice(0, 5).map(n => (
              <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                <div className={`notification-dot ${n.read ? 'read' : ''}`} />
                <div>
                  <div className="notification-text">{n.message}</div>
                  <div className="notification-time">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
                No notifications yet.
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h3 style={{ marginBottom: 16 }}>✅ Task History</h3>
            <div className="grid-2">
              {completedTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
