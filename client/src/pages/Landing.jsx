import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const features = [
  { icon: '📊', title: 'Data Aggregation', desc: 'Centralize scattered community data from surveys, field reports, and observations into one unified platform.', color: '#eff6ff' },
  { icon: '🎯', title: 'Need Prioritization', desc: 'AI-powered scoring engine ranks community needs by urgency, population impact, and resource gaps.', color: '#fdf2f8' },
  { icon: '🤝', title: 'Smart Matching', desc: 'Automatically match volunteers to tasks based on skills, location, and availability.', color: '#f0fdf4' },
  { icon: '📱', title: 'Mobile-First', desc: 'Responsive design works on any device. Field workers can submit data from anywhere.', color: '#fffbeb' },
  { icon: '📈', title: 'Live Analytics', desc: 'Real-time dashboards with task breakdowns, volunteer utilization, and impact metrics.', color: '#f5f3ff' },
  { icon: '🔔', title: 'Instant Alerts', desc: 'Push notifications keep volunteers informed about new assignments and urgent tasks.', color: '#fff7ed' },
];

const steps = [
  { num: '1', title: 'Collect & Upload', desc: 'NGOs upload community data — surveys, field reports, and observations through simple forms.' },
  { num: '2', title: 'Analyze & Prioritize', desc: 'The platform analyzes data, identifies patterns, and ranks community needs by urgency.' },
  { num: '3', title: 'Match & Deploy', desc: 'Smart matching connects the right volunteer to the right task, at the right place.' },
];

const stats = [
  { value: '10K+', label: 'Community Reports' },
  { value: '500+', label: 'Active Volunteers' },
  { value: '95%', label: 'Match Accuracy' },
  { value: '45+', label: 'Cities Covered' },
];

export default function Landing() {
  return (
    <div className="landing" id="landing-page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content animate-in">
            <div className="hero-badge">✦ Smart Resource Allocation Platform</div>
            <h1>
              Connect Communities.<br />
              <span className="highlight">Empower Volunteers.</span>
            </h1>
            <p>
              VIRA transforms scattered NGO data into actionable insights and intelligently
              matches volunteers to the communities that need them most.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">Start Making Impact →</Link>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                Login to Dashboard
              </Link>
            </div>
            <div className="hero-stats">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="hero-stat-value">{s.value}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-grid">
            {[...Array(9)].map((_, i) => <div key={i} className="hero-grid-item" />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header animate-in">
            <span className="overline">Features</span>
            <h2>Everything You Need to Drive Impact</h2>
            <p>A complete toolkit for NGOs to collect data, prioritize needs, and coordinate volunteers efficiently.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className={`feature-card animate-in animate-in-delay-${(i % 4) + 1}`}>
                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <div className="section-header animate-in">
            <span className="overline">How It Works</span>
            <h2>Three Simple Steps to Impact</h2>
            <p>From data collection to volunteer deployment — streamlined for speed and accuracy.</p>
          </div>
          <div className="steps">
            {steps.map((s, i) => (
              <div key={i} className={`step animate-in animate-in-delay-${i + 1}`}>
                <div className="step-number">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="section" id="impact">
        <div className="container">
          <div className="section-header animate-in">
            <span className="overline">Impact</span>
            <h2>Numbers That Matter</h2>
            <p>Real impact measured in communities served and lives improved.</p>
          </div>
          <div className="impact-grid">
            {stats.map((s, i) => (
              <div key={i} className={`impact-item animate-in animate-in-delay-${i + 1}`}>
                <div className="impact-number">{s.value}</div>
                <div className="impact-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-alt" style={{ textAlign: 'center' }}>
        <div className="container animate-in">
          <h2 style={{ marginBottom: 16 }}>Ready to Make a Difference?</h2>
          <p style={{ maxWidth: 500, margin: '0 auto 32px', fontSize: '1.1rem' }}>
            Join VIRA today and be part of a smarter, faster, more impactful volunteer network.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Register as Volunteer</Link>
            <Link to="/register?role=admin" className="btn btn-secondary btn-lg">Register Your NGO</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
