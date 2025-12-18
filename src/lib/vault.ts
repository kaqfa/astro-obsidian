import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, parse } from 'path';
import matter from 'gray-matter';

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
        children: await getFileTree(fullPath)
      });
    } else if (item.endsWith('.md')) {
      tree.push({
        name: item.replace('.md', ''),
        path: relativePath,
        type: 'file'
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
    const filePath = join(VAULT_PATH, `${slug}.md`);
    const content = await readFile(filePath, 'utf-8');
    const { data, content: markdown } = matter(content);
    const stats = await stat(filePath);

    return {
      slug,
      title: data.title || parse(slug).name,
      path: slug,
      content: markdown,
      frontmatter: data,
      lastModified: stats.mtime
    };
  } catch {
    return null;
  }
}

export async function getAllNotes(): Promise<Note[]> {
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

export async function searchNotes(query: string): Promise<Note[]> {
  const allNotes = await getAllNotes();
  const lowerQuery = query.toLowerCase();

  return allNotes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(lowerQuery);
    const contentMatch = note.content.toLowerCase().includes(lowerQuery);
    return titleMatch || contentMatch;
  });
}

// In-memory cache untuk filename -> path mapping
let filePathCache: Map<string, string> | null = null;

/**
 * Build cache of basename -> full path mappings
 * Cache diupdate setiap kali function ini dipanggil
 */
export async function buildFilePathCache(): Promise<Map<string, string>> {
  const cache = new Map<string, string>();
  const notes = await getAllNotes();
  
  for (const note of notes) {
    // Extract basename from slug (tanpa path, tanpa extension)
    const basename = parse(note.slug).name;
    // Simpan mapping basename -> full slug path
    cache.set(basename.toLowerCase(), note.slug);
  }
  
  filePathCache = cache;
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
