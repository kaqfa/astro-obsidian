import { useState, useEffect } from 'react';

export default function ReadingModeToggle() {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load reading mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('readingMode') === 'true';
    setIsReadingMode(savedMode);

    // Apply to sidebar immediately
    const sidebar = document.querySelector('aside[data-sidebar]');
    if (sidebar) {
      sidebar.classList.toggle('hidden', savedMode);
    }

    setMounted(true);
  }, []);

  const toggleReadingMode = () => {
    const newMode = !isReadingMode;
    setIsReadingMode(newMode);
    localStorage.setItem('readingMode', String(newMode));

    // Toggle sidebar visibility
    const sidebar = document.querySelector('aside[data-sidebar]');
    if (sidebar) {
      sidebar.classList.toggle('hidden', newMode);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-bg-tertiary border border-border text-text-muted transition-all"
        disabled
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleReadingMode}
      className="p-2 rounded-lg bg-bg-tertiary hover:bg-bg-elevated border border-border hover:border-accent/50 text-text-muted hover:text-text-primary transition-all duration-200"
      title={isReadingMode ? 'Exit Reading Mode' : 'Enter Reading Mode'}
      aria-label={isReadingMode ? 'Exit Reading Mode' : 'Enter Reading Mode'}
    >
      {isReadingMode ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      )}
    </button>
  );
}
