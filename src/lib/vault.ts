import { validateSlug } from './path-validation.js';
import { readdir, readFile, stat } from 'fs/promises';
import matter from 'gray-matter';
import { join, relative, parse } from 'path';

const VAULT_PATH = './vault';

export interface Note {
  slug: string;
  title: string;
  path: string;
  content: string;
  frontmatter: Record<string, any>;
  lastModified: Date;
}

export interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeItem[];
}

export async function getFileTree(dir: string = VAULT_PATH): Promise<FileTreeItem[]> {
  const items = await readdir(dir);
  const tree: FileTreeItem[] = [];

  for (const item of items) {
    if (item.startsWith('.')) continue;

    const fullPath = join(dir, item);
    const stats = await stat(fullPath);
    const relativePath = relative(VAULT_PATH, fullPath);

    if (stats.isDirectory()) {
      tree.push({
        name: item,
        path: relativePath,
        type: 'folder',
        children: await getFileTree(fullPath),
      });
    } else if (item.endsWith('.md')) {
      tree.push({
        name: item.replace('.md', ''),
        path: relativePath,
        type: 'file',
      });
    }
  }

  return tree.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });
}

export async function getNote(slug: string): Promise<Note | null> {
  try {
    // Validate slug BEFORE file access to prevent path traversal
    const validatedSlug = validateSlug(slug);
    const filePath = join(VAULT_PATH, `${validatedSlug}.md`);
    const content = await readFile(filePath, 'utf-8');
    const { data, content: markdown } = matter(content);
    const stats = await stat(filePath);

    return {
      slug: validatedSlug,
      title: data.title || parse(validatedSlug).name,
      path: validatedSlug,
      content: markdown,
      frontmatter: data,
      lastModified: stats.mtime,
    };
  } catch (error) {
    console.error('[VAULT] Error reading note:', slug, error);
    return null;
  }
}

export async function getAllNotes(): Promise<Note[]> {
  // Return cached notes if available
  if (notesCache) {
    return notesCache;
  }

  // Otherwise, scan and cache
  console.log('[Cache] Cache miss - scanning all notes...');
  notesCache = await scanAllNotes();
  notesCacheTimestamp = Date.now();
  return notesCache;
}

export async function searchNotes(query: string): Promise<Note[]> {
  const allNotes = await getAllNotes();
  const lowerQuery = query.toLowerCase();

  return allNotes.filter((note) => {
    const titleMatch = note.title.toLowerCase().includes(lowerQuery);
    const contentMatch = note.content.toLowerCase().includes(lowerQuery);
    return titleMatch || contentMatch;
  });
}

// ============================================
// SERVER-LEVEL CACHING SYSTEM
// ============================================

// Cache for all notes (populated on startup/sync)
let notesCache: Note[] | null = null;
let notesCacheTimestamp: number = 0;

// In-memory cache untuk filename -> path mapping
let filePathCache: Map<string, string> | null = null;

/**
 * Build cache of basename -> full path mappings
 * Cache diupdate setiap kali function ini dipanggil
 */
export async function buildFilePathCache(): Promise<Map<string, string>> {
  const cache = new Map<string, string>();
  // Use cached notes if available to avoid re-scanning
  const notes = notesCache || (await getAllNotes());

  for (const note of notes) {
    // Store multiple mappings for better wikilink resolution:

    // 1. Basename only (e.g., "W51-Plan" -> "Weekly/2025/W51-Plan")
    const basename = parse(note.slug).name;
    cache.set(basename.toLowerCase(), note.slug);

    // 2. Full slug (e.g., "Weekly/2025/W51-Plan" -> "Weekly/2025/W51-Plan")
    cache.set(note.slug.toLowerCase(), note.slug);

    // 3. Handle paths with or without extension
    // This helps with links like [[folder/file]] or [[folder/file.md]]
    if (note.slug.includes('/')) {
      const parts = note.slug.split('/');
      // Also store partial paths like "2025/W51-Plan"
      for (let i = 1; i < parts.length; i++) {
        const partialPath = parts.slice(i).join('/');
        if (!cache.has(partialPath.toLowerCase())) {
          cache.set(partialPath.toLowerCase(), note.slug);
        }
      }
    }
  }

  filePathCache = cache;
  console.log(
    `[Cache] File path cache built with ${cache.size} mappings for ${notes.length} notes`
  );
  return cache;
}

/**
 * Find note path based on basename (case-insensitive)
 * Returns null if not found
 */
export function findNoteByBasename(basename: string): string | null {
  if (!filePathCache) {
    // Cache belum di-build, return null
    return null;
  }

  return filePathCache.get(basename.toLowerCase()) || null;
}

/**
 * Get the cached file path map (for use in markdown processing)
 */
export function getFilePathCache(): Map<string, string> | null {
  return filePathCache;
}

/**
 * Warm all caches on server startup or after sync
 * This prevents repeated file system scans
 */
export async function warmCaches(): Promise<void> {
  console.log('[Cache] Warming caches...');
  const startTime = Date.now();

  // Build notes cache
  notesCache = await scanAllNotes();
  notesCacheTimestamp = Date.now();

  // Build file path cache from notes cache
  await buildFilePathCache();

  const duration = Date.now() - startTime;
  console.log(`[Cache] Caches warmed in ${duration}ms (${notesCache.length} notes)`);
}

/**
 * Invalidate all caches (call before warming)
 */
export function invalidateCaches(): void {
  console.log('[Cache] Invalidating all caches...');
  notesCache = null;
  notesCacheTimestamp = 0;
  filePathCache = null;
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    notesCount: notesCache?.length || 0,
    filePathMappings: filePathCache?.size || 0,
    cacheAge: notesCacheTimestamp ? Date.now() - notesCacheTimestamp : 0,
    isCached: !!notesCache,
  };
}

/**
 * Internal function to actually scan all notes
 * This is the expensive operation we want to cache
 */
async function scanAllNotes(): Promise<Note[]> {
  const notes: Note[] = [];

  async function scanDir(dir: string) {
    const items = await readdir(dir);

    for (const item of items) {
      if (item.startsWith('.')) continue;

      const fullPath = join(dir, item);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await scanDir(fullPath);
      } else if (item.endsWith('.md')) {
        const relativePath = relative(VAULT_PATH, fullPath);
        const slug = relativePath.replace('.md', '');
        const note = await getNote(slug);
        if (note) notes.push(note);
      }
    }
  }

  await scanDir(VAULT_PATH);
  return notes;
}
