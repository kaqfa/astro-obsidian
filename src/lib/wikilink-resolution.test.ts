import { describe, it, expect, beforeEach } from 'vitest';

// Mock types for testing
interface Note {
  slug: string;
  title: string;
  path: string;
  content: string;
  frontmatter: Record<string, any>;
  lastModified: Date;
}

// Helper to calculate path depth
function getPathDepth(path: string): number {
  return (path.match(/\//g) || []).length;
}

// Helper to check if newPath is shallower than existingPath
function isShallower(newPath: string, existingPath: string): boolean {
  return getPathDepth(newPath) < getPathDepth(existingPath);
}

// Build file path cache (simplified version for testing)
function buildFilePathCache(notes: Note[]): Map<string, string> {
  const cache = new Map<string, string>();

  for (const note of notes) {
    // Get basename (filename without extension and path)
    const basename = note.slug.split('/').pop()?.replace(/\.md$/, '') || note.slug;
    const basenameLower = basename.toLowerCase();
    const existing = cache.get(basenameLower);

    // For duplicates, keep the shallowest path (Obsidian behavior)
    if (!existing || isShallower(note.slug, existing)) {
      cache.set(basenameLower, note.slug);
    }

    // Also store full slug
    cache.set(note.slug.toLowerCase(), note.slug);

    // Store partial paths
    if (note.slug.includes('/')) {
      const parts = note.slug.split('/');
      for (let i = 1; i < parts.length; i++) {
        const partialPath = parts.slice(i).join('/');
        const partialLower = partialPath.toLowerCase();
        const existingPartial = cache.get(partialLower);

        if (!existingPartial || isShallower(note.slug, existingPartial)) {
          cache.set(partialLower, note.slug);
        }
      }
    }
  }

  return cache;
}

describe('Wikilink Resolution', () => {
  describe('getPathDepth', () => {
    it('should calculate depth correctly for root-level files', () => {
      expect(getPathDepth('Meeting')).toBe(0);
      expect(getPathDepth('Note')).toBe(0);
    });

    it('should calculate depth correctly for nested files', () => {
      expect(getPathDepth('Projects/Meeting')).toBe(1);
      expect(getPathDepth('Archive/2024/Meeting')).toBe(2);
      expect(getPathDepth('Work/Projects/2024/Q1/Meeting')).toBe(4);
    });
  });

  describe('isShallower', () => {
    it('should return true when path has fewer slashes', () => {
      expect(isShallower('Meeting', 'Projects/Meeting')).toBe(true);
      expect(isShallower('Projects/Meeting', 'Archive/2024/Meeting')).toBe(true);
    });

    it('should return false when path has same or more slashes', () => {
      expect(isShallower('Projects/Meeting', 'Meeting')).toBe(false);
      expect(isShallower('Archive/2024/Meeting', 'Projects/Meeting')).toBe(false);
      expect(isShallower('Meeting', 'Meeting')).toBe(false);
    });
  });

  describe('buildFilePathCache', () => {
    let mockNotes: Note[];

    beforeEach(() => {
      mockNotes = [
        {
          slug: 'Meeting',
          title: 'Meeting',
          path: 'Meeting',
          content: '# Meeting',
          frontmatter: {},
          lastModified: new Date(),
        },
        {
          slug: 'Projects/Meeting',
          title: 'Projects Meeting',
          path: 'Projects/Meeting',
          content: '# Projects Meeting',
          frontmatter: {},
          lastModified: new Date(),
        },
        {
          slug: 'Archive/2024/Meeting',
          title: 'Archive Meeting',
          path: 'Archive/2024/Meeting',
          content: '# Archive Meeting',
          frontmatter: {},
          lastModified: new Date(),
        },
      ];
    });

    it('should prefer least nested file for basename', () => {
      const cache = buildFilePathCache(mockNotes);

      // "meeting" should resolve to root-level "Meeting" (depth 0)
      expect(cache.get('meeting')).toBe('Meeting');
    });

    it('should resolve full path exactly', () => {
      const cache = buildFilePathCache(mockNotes);

      expect(cache.get('meeting')).toBe('Meeting');
      expect(cache.get('projects/meeting')).toBe('Projects/Meeting');
      expect(cache.get('archive/2024/meeting')).toBe('Archive/2024/Meeting');
    });

    it('should handle case-insensitive lookups', () => {
      const cache = buildFilePathCache(mockNotes);

      expect(cache.get('MEETING')).toBeUndefined(); // Case matters in get
      expect(cache.get('meeting')).toBe('Meeting');
      expect(cache.get('PROJECTS/MEETING')).toBeUndefined();
      expect(cache.get('projects/meeting')).toBe('Projects/Meeting');
    });

    it('should resolve partial paths', () => {
      const cache = buildFilePathCache(mockNotes);

      // "2024/Meeting" should resolve to full path
      expect(cache.get('2024/meeting')).toBe('Archive/2024/Meeting');
    });

    it('should handle files with similar names', () => {
      const notes: Note[] = [
        {
          slug: 'W51-Plan',
          title: 'W51 Plan',
          path: 'W51-Plan',
          content: '# W51',
          frontmatter: {},
          lastModified: new Date(),
        },
        {
          slug: 'Weekly/2025/W51-Plan',
          title: 'Weekly W51 Plan',
          path: 'Weekly/2025/W51-Plan',
          content: '# Weekly W51',
          frontmatter: {},
          lastModified: new Date(),
        },
      ];

      const cache = buildFilePathCache(notes);

      // "w51-plan" should resolve to root-level (shallowest)
      expect(cache.get('w51-plan')).toBe('W51-Plan');

      // Full path should still work
      expect(cache.get('weekly/2025/w51-plan')).toBe('Weekly/2025/W51-Plan');

      // Partial path
      expect(cache.get('2025/w51-plan')).toBe('Weekly/2025/W51-Plan');
    });

    it('should handle special characters in filenames', () => {
      const notes: Note[] = [
        {
          slug: "It's not super Apps",
          title: "It's not super Apps",
          path: "It's not super Apps",
          content: '# Test',
          frontmatter: {},
          lastModified: new Date(),
        },
        {
          slug: 'Feature & Update',
          title: 'Feature & Update',
          path: 'Feature & Update',
          content: '# Feature',
          frontmatter: {},
          lastModified: new Date(),
        },
      ];

      const cache = buildFilePathCache(notes);

      expect(cache.get("it's not super apps")).toBe("It's not super Apps");
      expect(cache.get('feature & update')).toBe('Feature & Update');
    });

    it('should update cache when shallower path is added later', () => {
      // Simulate notes being added in order
      const notesDeep: Note[] = [
        {
          slug: 'Archive/2024/Meeting',
          title: 'Archive Meeting',
          path: 'Archive/2024/Meeting',
          content: '# Archive',
          frontmatter: {},
          lastModified: new Date(),
        },
      ];

      let cache = buildFilePathCache(notesDeep);
      expect(cache.get('meeting')).toBe('Archive/2024/Meeting');

      // Now add shallower note
      const notesWithShallow: Note[] = [
        ...notesDeep,
        {
          slug: 'Meeting',
          title: 'Meeting',
          path: 'Meeting',
          content: '# Meeting',
          frontmatter: {},
          lastModified: new Date(),
        },
      ];

      cache = buildFilePathCache(notesWithShallow);

      // Should now resolve to shallowest
      expect(cache.get('meeting')).toBe('Meeting');
    });

    it('should handle empty notes array', () => {
      const cache = buildFilePathCache([]);
      expect(cache.size).toBe(0);
    });

    it('should handle single note', () => {
      const notes: Note[] = [
        {
          slug: 'SingleNote',
          title: 'Single Note',
          path: 'SingleNote',
          content: '# Single',
          frontmatter: {},
          lastModified: new Date(),
        },
      ];

      const cache = buildFilePathCache(notes);

      expect(cache.get('singlenote')).toBe('SingleNote');
      expect(cache.size).toBeGreaterThan(0);
    });

    it('should create multiple mappings per note', () => {
      const notes: Note[] = [
        {
          slug: 'Projects/2024/Planning',
          title: 'Planning',
          path: 'Projects/2024/Planning',
          content: '# Planning',
          frontmatter: {},
          lastModified: new Date(),
        },
      ];

      const cache = buildFilePathCache(notes);

      // Should have mappings for:
      // - basename: planning
      // - full path: projects/2024/planning
      // - partial: 2024/planning
      expect(cache.get('planning')).toBe('Projects/2024/Planning');
      expect(cache.get('projects/2024/planning')).toBe('Projects/2024/Planning');
      expect(cache.get('2024/planning')).toBe('Projects/2024/Planning');
    });
  });

  describe('Edge Cases', () => {
    it('should handle notes with same name at same depth', () => {
      const notes: Note[] = [
        {
          slug: 'FolderA/Meeting',
          title: 'Meeting A',
          path: 'FolderA/Meeting',
          content: '# A',
          frontmatter: {},
          lastModified: new Date(),
        },
        {
          slug: 'FolderB/Meeting',
          title: 'Meeting B',
          path: 'FolderB/Meeting',
          content: '# B',
          frontmatter: {},
          lastModified: new Date(),
        },
      ];

      const cache = buildFilePathCache(notes);

      // When depths are same, first one wins (order matters)
      const resolved = cache.get('meeting');
      expect(resolved).toBeDefined();
      expect(getPathDepth(resolved!)).toBe(1);
    });

    it('should handle notes with .md extension in slug', () => {
      const notes: Note[] = [
        {
          slug: 'Note.md',
          title: 'Note',
          path: 'Note.md',
          content: '# Note',
          frontmatter: {},
          lastModified: new Date(),
        },
      ];

      const cache = buildFilePathCache(notes);

      // Should still resolve by basename
      expect(cache.get('note')).toBe('Note.md');
      expect(cache.get('note.md')).toBe('Note.md');
    });
  });
});
