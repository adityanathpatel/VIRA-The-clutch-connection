import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const adminLinks = [
  { to: '/admin',            icon: '📊', label: 'Dashboard' },
  { to: '/admin/tasks',      icon: '📋', label: 'Tasks' },
  { to: '/admin/tasks/new',  icon: '➕', label: 'Create Task' },
  { to: '/admin/volunteers', icon: '👥', label: 'Volunteers' },
  { to: '/admin/data',       icon: '📂', label: 'Data Upload' },
  { to: '/admin/analytics',  icon: '📈', label: 'Analytics' },
  { to: '/map',              icon: '🗺️', label: 'Map View' },
];

const volunteerLinks = [
  { to: '/volunteer',        icon: '🏠', label: 'Dashboard' },
  { to: '/volunteer/tasks',  icon: '📋', label: 'My Tasks' },
  { to: '/map',              icon: '🗺️', label: 'Map View' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { isOpen, mobile, close } = useSidebar();
  const links = user?.role === 'admin' ? adminLinks : volunteerLinks;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const handleLinkClick = () => {
    if (mobile) close();
  };

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--collapsed'}`}
      id="main-sidebar"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="sidebar-section">
        <div className="sidebar-label">Navigation</div>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/volunteer'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
            title={link.label}
          >
            <span className="icon">{link.icon}</span>
            <span className="sidebar-link-label">{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">General</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
          title="Settings"
        >
          <span className="icon">⚙️</span>
          <span className="sidebar-link-label">Settings</span>
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="navbar-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
            {initials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
