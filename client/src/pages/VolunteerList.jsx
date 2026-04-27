import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { volunteerAPI } from '../services/api';

export default function VolunteerList() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ skill: '', location: '' });

  useEffect(() => {
    volunteerAPI.list()
      .then(data => setVolunteers(data.volunteers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  let filtered = volunteers;
  if (filter.skill) {
    filtered = filtered.filter(v => v.profile?.skills?.includes(filter.skill));
  }
  if (filter.location) {
    filtered = filtered.filter(v =>
      v.profile?.location?.toLowerCase().includes(filter.location.toLowerCase())
    );
  }

  const allSkills = [...new Set(volunteers.flatMap(v => v.profile?.skills || []))];
  const allLocations = [...new Set(volunteers.map(v => v.profile?.location).filter(Boolean))];

  if (loading) return <DashboardLayout><div className="loading-spinner"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div id="volunteer-list">
        <div className="page-header">
          <h1>Volunteers</h1>
          <p>{filtered.length} volunteers found</p>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <select value={filter.skill} onChange={e => setFilter({ ...filter, skill: e.target.value })}>
            <option value="">All Skills</option>
            {allSkills.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <select value={filter.location} onChange={e => setFilter({ ...filter, location: e.target.value })}>
            <option value="">All Locations</option>
            {allLocations.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          {(filter.skill || filter.location) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilter({ skill: '', location: '' })}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Volunteer Table */}
        {filtered.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Skills</th>
                  <th>Availability</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="navbar-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                          {v.name?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 600 }}>{v.name}</span>
                      </div>
                    </td>
                    <td className="text-light">{v.email}</td>
                    <td>📍 {v.profile?.location || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(v.profile?.skills || []).map(s => (
                          <span key={s} className="badge badge-assigned" style={{ fontSize: '0.7rem' }}>
                            {s.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-completed" style={{ textTransform: 'capitalize' }}>
                        {v.profile?.availability?.replace('_', ' ') || '—'}
                      </span>
                    </td>
                    <td className="text-sm text-light">{new Date(v.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Volunteers Found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
