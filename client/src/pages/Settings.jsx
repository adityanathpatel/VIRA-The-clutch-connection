import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { volunteerAPI } from '../services/api';

const SKILLS_OPTIONS = [
  'teaching', 'medical', 'first_aid', 'cooking', 'driving',
  'logistics', 'counseling', 'construction', 'farming', 'event_management',
];

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    name: '', skills: [], location: '', availability: 'weekends', phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        skills: user.profile?.skills || [],
        location: user.profile?.location || '',
        availability: user.profile?.availability || 'weekends',
        phone: user.profile?.phone || '',
      });
    }
  }, [user]);

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await volunteerAPI.updateProfile(form);
      await refreshUser();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div id="settings-page">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Manage your profile and preferences</p>
        </div>

        <div className="settings-layout">
          {/* Nav */}
          <div className="settings-nav">
            <div className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}>
              👤 Profile
            </div>
            <div className={`settings-nav-item ${activeTab === 'language' ? 'active' : ''}`}
              onClick={() => setActiveTab('language')}>
              🌐 Language
            </div>
            <div className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}>
              🔒 Account
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'profile' && (
              <div className="card">
                <h3 style={{ marginBottom: 20 }}>Profile Settings</h3>

                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label htmlFor="settings-name">Full Name</label>
                    <input id="settings-name" type="text" className="form-control"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control" value={user?.email || ''} disabled
                      style={{ opacity: 0.6 }} />
                    <div className="text-xs text-light" style={{ marginTop: 4 }}>Email cannot be changed.</div>
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <input type="text" className="form-control" value={user?.role || ''} disabled
                      style={{ opacity: 0.6, textTransform: 'capitalize' }} />
                  </div>

                  {user?.role === 'volunteer' && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="settings-location">Location</label>
                          <input id="settings-location" type="text" className="form-control"
                            value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="settings-availability">Availability</label>
                          <select id="settings-availability" className="form-control"
                            value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
                            <option value="weekends">Weekends</option>
                            <option value="weekdays">Weekdays</option>
                            <option value="full_time">Full Time</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="settings-phone">Phone</label>
                        <input id="settings-phone" type="tel" className="form-control"
                          value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                      </div>

                      <div className="form-group">
                        <label>Skills</label>
                        <div className="checkbox-group">
                          {SKILLS_OPTIONS.map(skill => (
                            <label key={skill} className={`checkbox-pill ${form.skills.includes(skill) ? 'active' : ''}`}>
                              <input type="checkbox" checked={form.skills.includes(skill)}
                                onChange={() => toggleSkill(skill)} />
                              {skill.replace('_', ' ')}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="card">
                <h3 style={{ marginBottom: 20 }}>Language Preferences</h3>
                <div className="form-group">
                  <label htmlFor="settings-lang">Display Language</label>
                  <select id="settings-lang" className="form-control" value={lang}
                    onChange={e => setLang(e.target.value)} style={{ maxWidth: 300 }}>
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 Hindi (हिन्दी)</option>
                    <option value="mr">🇮🇳 Marathi (मराठी)</option>
                    <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
                    <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                  </select>
                </div>
                <div className="alert alert-success" style={{ marginTop: 8 }}>
                  Language preference saved. Full i18n support coming in v2.0.
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="card">
                <h3 style={{ marginBottom: 20 }}>Account Settings</h3>
                <div className="card" style={{ background: 'var(--gray-50)', border: 'none', padding: 20 }}>
                  <h4>Account Information</h4>
                  <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                    <div><strong>User ID:</strong> <span className="text-light text-sm">{user?.id}</span></div>
                    <div><strong>Role:</strong> <span className="text-light text-sm" style={{ textTransform: 'capitalize' }}>{user?.role}</span></div>
                    <div><strong>Joined:</strong> <span className="text-light text-sm">{new Date(user?.createdAt).toLocaleDateString()}</span></div>
                    {user?.organization && (
                      <div><strong>Organization:</strong> <span className="text-light text-sm">{user?.organization}</span></div>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <button className="btn btn-danger btn-sm">🗑️ Delete Account</button>
                  <p className="text-xs text-light" style={{ marginTop: 8 }}>This action cannot be undone.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
