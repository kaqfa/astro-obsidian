import { useEffect, useState } from 'react';

interface RecentNote {
  slug: string;
  title: string;
  path: string;
  viewedAt: number;
}

export default function RecentNotes() {
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load recent notes from localStorage
    const loadRecentNotes = () => {
      try {
        const stored = localStorage.getItem('obsidian-recent-notes');
        if (stored) {
          const parsed = JSON.parse(stored) as RecentNote[];
          setRecentNotes(parsed.sort((a, b) => b.viewedAt - a.viewedAt));
        }
      } catch (e) {
        console.error('[RecentNotes] Failed to load:', e);
      }
    };

    loadRecentNotes();

    // Listen for storage changes (sync across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'obsidian-recent-notes') {
        loadRecentNotes();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom event when note is viewed
  useEffect(() => {
    const handleNoteViewed = () => {
      try {
        const stored = localStorage.getItem('obsidian-recent-notes');
        if (stored) {
          const parsed = JSON.parse(stored) as RecentNote[];
          setRecentNotes(parsed.sort((a, b) => b.viewedAt - a.viewedAt));
        }
      } catch (e) {
        console.error('[RecentNotes] Failed to refresh:', e);
      }
    };

    window.addEventListener('recentNoteUpdated', handleNoteViewed);
    return () => window.removeEventListener('recentNoteUpdated', handleNoteViewed);
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  if (recentNotes.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
      >
        <span className="text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Recent Notes
          <span className="text-xs bg-accent/20 text-accent px-1.5 rounded-full">
            {recentNotes.length}
          </span>
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-2 pb-2 space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
          {recentNotes.map((note) => (
            <a
              key={note.slug}
              href={`/notes/${note.slug}`}
              className="block px-2 py-1.5 rounded text-sm text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors truncate"
              title={note.title}
            >
              <div className="truncate">{note.title}</div>
              <div className="text-xs text-text-muted/60 mt-0.5">
                {formatTimeAgo(note.viewedAt)}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
