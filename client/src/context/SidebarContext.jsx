import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const isMobile = () => window.innerWidth < 768;

  // Desktop: expanded by default. Mobile: collapsed by default.
  const [isOpen, setIsOpen] = useState(!isMobile());
  const [mobile, setMobile] = useState(isMobile());

  // Track viewport changes
  useEffect(() => {
    const handleResize = () => {
      const nowMobile = isMobile();
      setMobile(nowMobile);
      // When crossing breakpoint: auto-expand on desktop, auto-collapse on mobile
      setIsOpen(!nowMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen && mobile) close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, mobile, close]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobile, isOpen]);

  return (
    <SidebarContext.Provider value={{ isOpen, mobile, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
