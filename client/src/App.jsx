import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VolunteerDashboard from './pages/VolunteerDashboard';
import VolunteerTasks from './pages/VolunteerTasks';
import AdminDashboard from './pages/AdminDashboard';
import TaskManagement from './pages/TaskManagement';
import CreateTask from './pages/CreateTask';
import TaskDetail from './pages/TaskDetail';
import DataUpload from './pages/DataUpload';
import Analytics from './pages/Analytics';
import MapView from './pages/MapView';
import VolunteerList from './pages/VolunteerList';
import Settings from './pages/Settings';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} /> : <Register />} />

        {/* Volunteer Routes */}
        <Route path="/volunteer" element={<ProtectedRoute role="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/volunteer/tasks" element={<ProtectedRoute role="volunteer"><VolunteerTasks /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tasks" element={<ProtectedRoute role="admin"><TaskManagement /></ProtectedRoute>} />
        <Route path="/admin/tasks/new" element={<ProtectedRoute role="admin"><CreateTask /></ProtectedRoute>} />
        <Route path="/admin/volunteers" element={<ProtectedRoute role="admin"><VolunteerList /></ProtectedRoute>} />
        <Route path="/admin/data" element={<ProtectedRoute role="admin"><DataUpload /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />

        {/* Shared Protected Routes */}
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
