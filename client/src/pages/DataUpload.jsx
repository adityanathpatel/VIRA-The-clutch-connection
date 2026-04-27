import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { dataAPI } from '../services/api';

export default function DataUpload() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: 'survey', title: '', content: '', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    try {
      const data = await dataAPI.reports();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await dataAPI.upload(form);
      setSuccess('Report uploaded successfully!');
      setForm({ type: 'survey', title: '', content: '', location: '' });
      loadReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div id="data-upload">
        <div className="page-header">
          <h1>Data Upload</h1>
          <p>Submit community surveys, field reports, and observations</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Upload Form */}
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>📝 Submit New Report</h3>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="report-type">Report Type</label>
                  <select id="report-type" className="form-control"
                    value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="survey">📋 Survey</option>
                    <option value="report">📄 Field Report</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="report-location">Location</label>
                  <input id="report-location" type="text" className="form-control"
                    placeholder="e.g. Mumbai" value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="report-title">Title</label>
                <input id="report-title" type="text" className="form-control"
                  placeholder="Brief title for this report" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label htmlFor="report-content">Content *</label>
                <textarea id="report-content" className="form-control" rows="6"
                  placeholder="Enter survey data, field observations, or report details..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })} required />
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Uploading...' : '📤 Upload Report'}
              </button>
            </form>
          </div>

          {/* Recent Reports */}
          <div>
            <h3 style={{ marginBottom: 16 }}>📂 Recent Reports ({reports.length})</h3>
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reports.map(r => (
                  <div key={r.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h4 style={{ fontSize: '0.95rem' }}>{r.title}</h4>
                      <span className={`badge ${r.type === 'survey' ? 'badge-assigned' : 'badge-medium'}`}>{r.type}</span>
                    </div>
                    <p className="text-sm" style={{ marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.content}
                    </p>
                    <div className="text-xs text-light">
                      📍 {r.location} · 👤 {r.submittedByName} · 📅 {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card empty-state">
                <div className="empty-icon">📂</div>
                <h3>No Reports Yet</h3>
                <p>Submit your first report using the form.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
