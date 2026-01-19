import { useEffect, useState } from 'react';

export default function SidebarToggle() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
    const overlay = document.querySelector('[data-sidebar-overlay]') as HTMLElement;

    if (!sidebar) return;

    // Handle sidebar toggle
    const toggleSidebar = (open: boolean) => {
      if (open) {
        sidebar.classList.add('sidebar-open');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll on mobile
      } else {
        sidebar.classList.remove('sidebar-open');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
      }
    };

    toggleSidebar(isSidebarOpen);

    // Handle overlay click to close
    const handleOverlayClick = () => {
      setIsSidebarOpen(false);
    };

    overlay?.addEventListener('click', handleOverlayClick);

    // Handle escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Close sidebar on navigation (for mobile)
    const handleNavigation = () => {
      if (window.innerWidth < 1024) {
        // lg breakpoint
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('astro:after-swap', handleNavigation);

    return () => {
      overlay?.removeEventListener('click', handleOverlayClick);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('astro:after-swap', handleNavigation);
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <button
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
      aria-label="Toggle sidebar"
      type="button"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
