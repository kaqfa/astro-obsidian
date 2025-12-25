import type { AstroIntegration } from 'astro';
import type { FileTreeItem } from '../lib/vault';

// Global cache storage (shared across all requests)
let globalFileTree: FileTreeItem[] | null = null;
let globalAllNotes: Awaited<ReturnType<typeof import('../lib/vault').getAllNotes>> | null = null;

/**
 * Refresh global cache data (call after sync)
 */
export async function refreshGlobalCache(): Promise<void> {
  console.log('[Integration] Refreshing global cache...');
  const { getFileTree, getAllNotes } = await import('../lib/vault.ts');
  globalFileTree = await getFileTree();
  globalAllNotes = await getAllNotes();
  console.log('[Integration] Global cache refreshed');
}

/**
 * Astro integration to warm caches on server startup
 * This ensures fast initial page loads by pre-loading all notes
 */
export function cacheWarming(): AstroIntegration {
  return {
    name: 'cache-warming',
    hooks: {
      'astro:server:setup': async () => {
        console.log('[Integration] Server starting - warming caches...');
        try {
          // Dynamic import to avoid circular dependencies
          const { warmCaches } = await import('../lib/vault.ts');
          await warmCaches();

          // Pre-fetch and cache layout data globally
          await refreshGlobalCache();

          console.log('[Integration] Cache warming complete');
        } catch (error) {
          console.error('[Integration] Failed to warm caches:', error);
        }
      },
      'astro:build:start': async () => {
        console.log('[Integration] Build starting - warming caches...');
        try {
          const { warmCaches } = await import('../lib/vault.ts');
          await warmCaches();
          console.log('[Integration] Cache warming complete');
        } catch (error) {
          console.error('[Integration] Failed to warm caches:', error);
        }
      },
      'astro:middleware': async ({ locals }) => {
        // Inject cached data into locals for all requests
        if (globalFileTree) {
          locals.fileTree = globalFileTree;
        }
        if (globalAllNotes) {
          locals.allNotes = globalAllNotes;
        }
      }
    }
  };
}
