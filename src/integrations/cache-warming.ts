import type { FileTreeItem } from '../lib/vault';
import type { AstroIntegration } from 'astro';

let globalFileTree: FileTreeItem[] | null = null;
let globalAllNotes: Awaited<ReturnType<typeof import('../lib/vault').getAllNotes>> | null = null;

/**
 * Helper to dynamic import vault module with fallback for dev/production
 */
async function importVaultModule() {
  // Try .js extension first (production), then .ts (development), then no extension
  try {
    return await import('../lib/vault.js');
  } catch {
    try {
      return await import('../lib/vault.ts');
    } catch {
      return await import('../lib/vault');
    }
  }
}

/**
 * Refresh global cache data (call after sync)
 */
export async function refreshGlobalCache(): Promise<void> {
  console.log('[Integration] Refreshing global cache...');
  const { getFileTree, getAllNotes } = await importVaultModule();
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
          const { warmCaches } = await importVaultModule();
          await warmCaches();

          // Pre-fetch and cache layout data globally
          await refreshGlobalCache();

          console.log('[Integration] Cache warming complete');
        } catch {
          // In development mode, modules might not be available yet
          // Cache will be warmed on first request instead
          console.log('[Integration] Cache warming skipped (will warm on first request)');
        }
      },
      'astro:build:start': async () => {
        // Skip cache warming during build - modules not yet compiled
        // Cache will be warmed at runtime instead
        console.log('[Integration] Build detected - skipping cache warming (will warm at runtime)');
      },
      'astro:middleware': async ({ locals }) => {
        // Inject cached data into locals for all requests
        if (globalFileTree) {
          locals.fileTree = globalFileTree;
        }
        if (globalAllNotes) {
          locals.allNotes = globalAllNotes;
        }
      },
    },
  };
}
