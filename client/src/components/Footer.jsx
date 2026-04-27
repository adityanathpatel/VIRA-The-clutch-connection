import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>VIRA<span style={{ color: 'var(--accent-500)' }}>.</span></h3>
            <p>The Clutch Connection — Smart Resource Allocation for NGOs. Transforming scattered community data into prioritized action.</p>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/register">Get Started</Link>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <Link to="/login">Login</Link>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">Community</a>
            <a href="#">Blog</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:hello@vira.org">hello@vira.org</a>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 VIRA – The Clutch Connection. Built for social impact.</p>
        </div>
      </div>
    </footer>
  );
}
