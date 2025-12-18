/**
 * Astro integration to warm caches on server startup
 * This ensures fast initial page loads by pre-loading all notes
 */
export function cacheWarming() {
  return {
    name: 'cache-warming',
    hooks: {
      'astro:server:setup': async () => {
        console.log('[Integration] Server starting - warming caches...');
        try {
          // Dynamic import to avoid circular dependencies
          const { warmCaches } = await import('../lib/vault.ts');
          await warmCaches();
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
      }
    }
  };
}
