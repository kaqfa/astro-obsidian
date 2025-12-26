import type { APIRoute } from 'astro';
import { syncVault } from '../../lib/git';
import { invalidateMarkdownCache } from '../../lib/markdown';
import { requireSession } from '../../lib/api-utils';
import { invalidateCaches, warmCaches } from '../../lib/vault';
import { refreshGlobalCache } from '../../integrations/cache-warming';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    await requireSession(cookies);
    const result = await syncVault();

    // Invalidate and warm caches after successful sync
    if (result.success) {
      invalidateCaches();
      invalidateMarkdownCache(); // Clear all markdown cache
      await warmCaches(); // Rebuild notes and file path caches
      await refreshGlobalCache(); // Refresh global layout cache
    }

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
