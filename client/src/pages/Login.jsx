import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/volunteer');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@vira.org', password: 'admin123' });
    else setForm({ email: 'rahul@email.com', password: 'volunteer123' });
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-card animate-in">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your VIRA account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email" type="email" className="form-control"
              placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password" type="password" className="form-control"
              placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-divider">Quick Demo Login</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => fillDemo('admin')}>
            🏢 Admin Demo
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => fillDemo('volunteer')}>
            🙋 Volunteer Demo
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
