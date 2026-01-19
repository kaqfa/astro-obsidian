import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { publicNotesTable } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateSlug } from '@/lib/path-validation';
import { requireSession, createErrorResponse, createSuccessResponse } from '@/lib/api-utils';

/**
 * Toggle public sharing for a note
 * POST /api/share/toggle
 * Body: { slug: string, enabled: boolean, expiresInDays?: number }
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Require authentication
    const user = await requireSession(cookies);

    // Parse request body
    const body = await request.json();
    const { slug, enabled, expiresInDays } = body;

    // Validate slug
    if (!slug || typeof slug !== 'string') {
      return createErrorResponse('Invalid slug', 400);
    }

    // Validate slug format
    try {
      validateSlug(slug);
    } catch (error) {
      return createErrorResponse('Invalid slug format', 400);
    }

    if (enabled) {
      // Enable sharing
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      // Check if already exists
      const existing = await db
        .select()
        .from(publicNotesTable)
        .where(eq(publicNotesTable.slug, slug))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(publicNotesTable)
          .set({
            expiresAt: expiresAt ? expiresAt.getTime() : null,
            updatedAt: Date.now(),
          })
          .where(eq(publicNotesTable.slug, slug));
      } else {
        // Create new
        await db.insert(publicNotesTable).values({
          slug,
          createdBy: user.id,
          expiresAt: expiresAt ? expiresAt.getTime() : null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      // Generate public URL
      const baseUrl = new URL(request.url).origin;
      const publicUrl = `${baseUrl}/share/${encodeURIComponent(slug)}`;

      return createSuccessResponse({
        enabled: true,
        publicUrl,
        expiresAt: expiresAt?.toISOString() || null,
      });
    } else {
      // Disable sharing - delete entry
      await db.delete(publicNotesTable).where(eq(publicNotesTable.slug, slug));

      return createSuccessResponse({
        enabled: false,
        publicUrl: null,
      });
    }
  } catch (error) {
    console.error('[SHARE] Toggle failed:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to toggle sharing',
      500
    );
  }
};
