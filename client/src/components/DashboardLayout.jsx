import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useSidebar } from '../context/SidebarContext';

export default function DashboardLayout({ children }) {
  const { isOpen, mobile, close } = useSidebar();
  const location = useLocation();

  // Close sidebar on route change when on mobile
  useEffect(() => {
    if (mobile) close();
  }, [location.pathname, mobile, close]);

  return (
    <div className={`dashboard-layout ${isOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* Overlay — visible when sidebar is open on mobile only */}
      {mobile && (
        <div
          className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
          onClick={close}
          aria-hidden="true"
        />
      )}

      <Sidebar />

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}
