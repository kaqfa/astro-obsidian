import type { Note } from './vault';

export interface RecentNote {
  slug: string;
  title: string;
  path: string;
  viewedAt: number;
}

const STORAGE_KEY = 'obsidian-recent-notes';
const MAX_RECENT_NOTES = 10;

/**
 * Get recent notes from localStorage
 */
export function getRecentNotes(): RecentNote[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as RecentNote[];
    // Sort by viewedAt descending
    return parsed.sort((a, b) => b.viewedAt - a.viewedAt);
  } catch {
    return [];
  }
}

/**
 * Add a note to recent history
 */
export function addRecentNote(note: Note): void {
  if (typeof window === 'undefined') return;

  try {
    const recent = getRecentNotes();
    const now = Date.now();

    // Remove existing entry with same slug (if any)
    const filtered = recent.filter(r => r.slug !== note.slug);

    // Add new entry at the beginning
    const entry: RecentNote = {
      slug: note.slug,
      title: note.title,
      path: note.path,
      viewedAt: now
    };

    const updated = [entry, ...filtered].slice(0, MAX_RECENT_NOTES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[RecentNotes] Failed to save recent note:', error);
  }
}

/**
 * Clear all recent notes history
 */
export function clearRecentNotes(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[RecentNotes] Failed to clear recent notes:', error);
  }
}
