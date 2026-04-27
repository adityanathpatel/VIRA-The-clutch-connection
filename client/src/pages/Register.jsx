import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SKILLS_OPTIONS = [
  'teaching', 'medical', 'first_aid', 'cooking', 'driving',
  'logistics', 'counseling', 'construction', 'farming', 'event_management',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'admin' ? 'admin' : 'volunteer';

  const [role, setRole] = useState(defaultRole);
  const [form, setForm] = useState({
    name: '', email: '', password: '', organization: '',
    skills: [], location: '', availability: 'weekends', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, role };
      const user = await register(payload);
      navigate(user.role === 'admin' ? '/admin' : '/volunteer');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-card animate-in" style={{ maxWidth: 540 }}>
        <h1>Join VIRA</h1>
        <p className="auth-subtitle">Create your account and start making impact</p>

        {/* Role Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${role === 'volunteer' ? 'active' : ''}`} onClick={() => setRole('volunteer')}>
            🙋 Volunteer
          </button>
          <button className={`auth-tab ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>
            🏢 NGO / Admin
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" className="form-control" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className="form-control" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" className="form-control" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>

          {role === 'admin' && (
            <div className="form-group">
              <label htmlFor="reg-org">Organization Name</label>
              <input id="reg-org" type="text" className="form-control" placeholder="Your NGO name"
                value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
            </div>
          )}

          {role === 'volunteer' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-location">Location</label>
                  <input id="reg-location" type="text" className="form-control" placeholder="e.g. Mumbai"
                    value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-availability">Availability</label>
                  <select id="reg-availability" className="form-control"
                    value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
                    <option value="weekends">Weekends</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="full_time">Full Time</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-phone">Phone (optional)</label>
                <input id="reg-phone" type="tel" className="form-control" placeholder="+91-9876543210"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Skills</label>
                <div className="checkbox-group">
                  {SKILLS_OPTIONS.map(skill => (
                    <label key={skill} className={`checkbox-pill ${form.skills.includes(skill) ? 'active' : ''}`}>
                      <input type="checkbox" checked={form.skills.includes(skill)} onChange={() => toggleSkill(skill)} />
                      {skill.replace('_', ' ')}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : `Register as ${role === 'admin' ? 'NGO Admin' : 'Volunteer'} →`}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
