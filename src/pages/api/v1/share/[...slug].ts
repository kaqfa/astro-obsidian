import type { APIRoute } from 'astro';
import { makeNotePublic, makeNotePrivate, isNotePublic } from '../../../../lib/public-notes';
import {

  requireSession,
  createSuccessResponse,
  createErrorResponse,
  processSlugParam,
} from '../../../../lib/api-utils';

/**
 * GET /api/v1/share/[...slug] - Check if note is public
 */
export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    await requireSession(cookies);
    const slug = processSlugParam(params);
    const isPublic = await isNotePublic(slug);

    return createSuccessResponse({ isPublic });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to check note status', 500);
  }
};

/**
 * POST /api/v1/share/[...slug] - Make a note public
 */
export const POST: APIRoute = async ({ params, cookies, request }) => {
  try {
    const user = await requireSession(cookies);
    const slug = processSlugParam(params);

    // Get request body - may be empty
    let expiresAt: number | undefined;
    try {
      const body = await request.json();
      expiresAt = body.expiresAt;
    } catch {
      // No body or invalid JSON, expiresAt remains undefined
    }

    await makeNotePublic(slug, user.id, expiresAt);

    return createSuccessResponse({ message: 'Note is now public' });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to share note', 500);
  }
};

/**
 * DELETE /api/v1/share/[...slug] - Make a note private
 */
export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    await requireSession(cookies);
    const slug = processSlugParam(params);

    await makeNotePrivate(slug);

    return createSuccessResponse({ message: 'Note is now private' });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to unshare note', 500);
  }
};
