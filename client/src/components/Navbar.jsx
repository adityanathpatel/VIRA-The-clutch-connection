import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sidebar toggle — only available when logged in (dashboard pages)
  let sidebarCtx = null;
  try { sidebarCtx = useSidebar(); } catch {}

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/volunteer';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Hamburger — always visible when logged in, before the logo */}
        <div className="navbar-left">
          {user && sidebarCtx && (
            <button
              className={`navbar-hamburger ${sidebarCtx.isOpen ? 'open' : ''}`}
              onClick={sidebarCtx.toggle}
              aria-label="Toggle Menu"
              aria-expanded={sidebarCtx.isOpen}
              aria-controls="main-sidebar"
              id="navbar-hamburger-toggle"
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          )}

          <Link to="/" className="navbar-brand">
            <span className="brand-v">V</span>IRA<span className="brand-dot">.</span>
          </Link>
        </div>

        <div className="navbar-links">
          {!user ? (
            <>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#impact">Impact</a>
              <Link to="/login">Login</Link>
              <Link to="/register" className="navbar-cta">Get Started</Link>
            </>
          ) : (
            <>
              <Link to={dashboardPath}>Dashboard</Link>
              <Link to="/map">Map</Link>
              <Link to="/settings">Settings</Link>
              <div className="navbar-user">
                <Link to={dashboardPath} className="navbar-avatar" title={user.name}>{initials}</Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
              </div>
            </>
          )}
        </div>

        <button className="navbar-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`navbar-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {!user ? (
          <>
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it Works</a>
            <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-sm">Get Started</Link>
          </>
        ) : (
          <>
            <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link to="/map" onClick={() => setMobileOpen(false)}>Map View</Link>
            <Link to="/settings" onClick={() => setMobileOpen(false)}>Settings</Link>
            <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn btn-ghost btn-sm">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
