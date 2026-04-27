import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { taskAPI } from '../services/api';

const SKILL_OPTIONS = [
  'teaching', 'medical', 'first_aid', 'cooking', 'driving',
  'logistics', 'counseling', 'construction', 'farming', 'event_management',
];

export default function CreateTask() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'health',
    location: '', urgency: 'medium', requiredSkills: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await taskAPI.create(form);
      navigate('/admin/tasks');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div id="create-task" style={{ maxWidth: 700 }}>
        <div className="page-header">
          <h1>Create New Task</h1>
          <p>Define a community task and requirements</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="task-title">Task Title *</label>
              <input id="task-title" type="text" className="form-control"
                placeholder="e.g. Health Camp in Dharavi" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="form-group">
              <label htmlFor="task-desc">Description *</label>
              <textarea id="task-desc" className="form-control" rows="4"
                placeholder="Describe the task, objectives, and any specific requirements..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-category">Category *</label>
                <select id="task-category" className="form-control"
                  value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="health">🏥 Health</option>
                  <option value="food">🍲 Food</option>
                  <option value="education">📚 Education</option>
                  <option value="infrastructure">🏗️ Infrastructure</option>
                  <option value="welfare">🤝 Welfare</option>
                  <option value="environment">🌿 Environment</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-urgency">Urgency *</label>
                <select id="task-urgency" className="form-control"
                  value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="task-location">Location *</label>
              <input id="task-location" type="text" className="form-control"
                placeholder="e.g. Mumbai, Delhi, Pune" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Required Skills</label>
              <div className="checkbox-group">
                {SKILL_OPTIONS.map(skill => (
                  <label key={skill} className={`checkbox-pill ${form.requiredSkills.includes(skill) ? 'active' : ''}`}>
                    <input type="checkbox" checked={form.requiredSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)} />
                    {skill.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Creating...' : '✨ Create Task'}
              </button>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
