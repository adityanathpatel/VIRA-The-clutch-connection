/**
 * MapView.jsx
 * ─────────────────────────────────────────────────────────────
 * Full-featured map page integrating Google Maps with the
 * task system. Displays task markers, search, dark mode toggle,
 * and a task sidebar.
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import GoogleMapWidget from '../components/GoogleMapWidget';
import { taskAPI } from '../services/api';

/* ── Geo-coordinates for known cities (fallback positions) ── */
const CITY_GEO = {
  'Mumbai':    { lat: 19.0760, lng: 72.8777 },
  'Delhi':     { lat: 28.6139, lng: 77.2090 },
  'Pune':      { lat: 18.5204, lng: 73.8567 },
  'Chennai':   { lat: 13.0827, lng: 80.2707 },
  'Kolkata':   { lat: 22.5726, lng: 88.3639 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Lucknow':   { lat: 26.8467, lng: 80.9462 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur':    { lat: 26.9124, lng: 75.7873 },
};

const URGENCY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function MapView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Fetch tasks on mount
  useEffect(() => {
    taskAPI.list()
      .then(data => setTasks(data.tasks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Build markers from tasks ──
  const markers = useMemo(() => {
    // Group tasks by location for combined markers
    const byLocation = {};
    tasks.forEach(t => {
      const loc = t.location || 'Unknown';
      if (!byLocation[loc]) byLocation[loc] = [];
      byLocation[loc].push(t);
    });

    return Object.entries(byLocation)
      .filter(([loc]) => CITY_GEO[loc])  // only cities we have coords for
      .map(([location, locTasks]) => {
        const geo = CITY_GEO[location];
        const highestUrgency = locTasks.some(t => t.urgency === 'high') ? 'high'
          : locTasks.some(t => t.urgency === 'medium') ? 'medium' : 'low';

        return {
          lat: geo.lat,
          lng: geo.lng,
          title: `${location} (${locTasks.length} task${locTasks.length > 1 ? 's' : ''})`,
          info: `Urgency: ${highestUrgency} · Categories: ${[...new Set(locTasks.map(t => t.category))].join(', ')}`,
          _location: location,
          _tasks: locTasks,
          _urgency: highestUrgency,
        };
      });
  }, [tasks]);

  // Group tasks by location for sidebar
  const tasksByLocation = useMemo(() => {
    const grouped = {};
    tasks.forEach(t => {
      const loc = t.location || 'Unknown';
      if (!grouped[loc]) grouped[loc] = [];
      grouped[loc].push(t);
    });
    return grouped;
  }, [tasks]);

  const handleMarkerClick = (marker) => {
    setSelectedTask(marker._tasks?.[0] || null);
    // Scroll to the task in the sidebar
    const el = document.getElementById(`loc-group-${marker._location}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-spinner"><div className="spinner" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div id="map-view">
        {/* ── Page Header ── */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>🗺️ Map View</h1>
            <p>Visualize task distribution across locations with Google Maps</p>
          </div>

          {/* Dark Mode Toggle */}
          <button
            className={`gmap-dark-toggle ${darkMode ? 'active' : ''}`}
            onClick={() => setDarkMode(prev => !prev)}
            id="map-dark-mode-toggle"
          >
            {darkMode ? '☀️' : '🌙'} {darkMode ? 'Light' : 'Dark'} Map
          </button>
        </div>

        {/* ── Map + Sidebar Layout ── */}
        <div className="map-page">
          {/* Google Map */}
          <div className="map-container" style={{ minHeight: 500 }}>
            <GoogleMapWidget
              markers={markers}
              center={{ lat: 26.8467, lng: 80.9462 }}
              zoom={6}
              darkMode={darkMode}
              showSearch={true}
              showLocateMe={true}
              onMarkerClick={handleMarkerClick}
            />

            {/* Map Legend Overlay */}
            <div className="gmap-legend" id="map-legend">
              <div className="gmap-legend-title">Urgency</div>
              {Object.entries(URGENCY_COLORS).map(([key, color]) => (
                <div key={key} className="gmap-legend-item">
                  <span className="gmap-legend-dot" style={{ background: color }} />
                  <span>{key}</span>
                </div>
              ))}
              <div className="gmap-legend-divider" />
              <div className="gmap-legend-item">
                <span className="gmap-legend-dot" style={{ background: '#4285f4' }} />
                <span>Searched</span>
              </div>
              <div className="gmap-legend-item">
                <span className="gmap-legend-dot" style={{ background: '#34a853' }} />
                <span>Your Location</span>
              </div>
            </div>
          </div>

          {/* ── Task Sidebar ── */}
          <div className="map-sidebar" id="map-task-sidebar">
            <div className="map-sidebar-header">
              <h3>📍 Tasks by Location</h3>
              <span className="badge badge-assigned">{tasks.length} total</span>
            </div>

            {Object.keys(tasksByLocation).length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 16px' }}>
                <div className="empty-icon">📋</div>
                <h3>No Tasks Yet</h3>
                <p>Create tasks to see them pinned on the map.</p>
              </div>
            ) : (
              Object.entries(tasksByLocation).map(([location, locTasks]) => (
                <div key={location} id={`loc-group-${location}`} className="map-loc-group">
                  <div className="map-loc-header">
                    <span>📍 {location}</span>
                    <span className="badge badge-assigned">{locTasks.length}</span>
                  </div>

                  {locTasks.map(task => (
                    <div
                      key={task._id || task.id}
                      className={`map-task-card ${selectedTask?._id === task._id || selectedTask?.id === task.id ? 'active' : ''}`}
                      onClick={() => navigate(`/tasks/${task._id || task.id}`)}
                      id={`map-task-${task._id || task.id}`}
                    >
                      <div className="map-task-top">
                        <span className="map-task-title">{task.title}</span>
                        <span className={`badge badge-${task.urgency}`} style={{ fontSize: '0.65rem' }}>
                          {task.urgency}
                        </span>
                      </div>
                      <div className="map-task-meta">
                        {task.category} · {task.status}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
