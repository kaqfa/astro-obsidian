import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { publicNotesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSession, createErrorResponse, createSuccessResponse } from '@/lib/api-utils';

/**
 * Get sharing status for a note
 * GET /api/share/status?slug=note-slug
 */
export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    // Require authentication
    await requireSession(cookies);

    // Get slug from query params
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return createErrorResponse('Missing slug parameter', 400);
    }

    // Check if note is shared
    const shared = await db
      .select()
      .from(publicNotesTable)
      .where(eq(publicNotesTable.slug, slug))
      .limit(1);

    if (shared.length === 0) {
      return createSuccessResponse({
        enabled: false,
        publicUrl: null,
        expiresAt: null,
      });
    }

    const shareData = shared[0];

    // Check if expired
    if (shareData.expiresAt && shareData.expiresAt < Date.now()) {
      // Expired - delete and return false
      await db.delete(publicNotesTable).where(eq(publicNotesTable.slug, slug));

      return createSuccessResponse({
        enabled: false,
        publicUrl: null,
        expiresAt: null,
      });
    }

    // Generate public URL
    const baseUrl = url.origin;
    const publicUrl = `${baseUrl}/share/${encodeURIComponent(slug)}`;

    return createSuccessResponse({
      enabled: true,
      publicUrl,
      expiresAt: shareData.expiresAt ? new Date(shareData.expiresAt).toISOString() : null,
    });
  } catch (error) {
    console.error('[SHARE] Status check failed:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to check share status',
      500
    );
  }
};
