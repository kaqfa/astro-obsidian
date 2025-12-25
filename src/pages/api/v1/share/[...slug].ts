import type { APIRoute } from 'astro';
import { validateSession } from '../../../../lib/middleware';
import { makeNotePublic, makeNotePrivate, isNotePublic } from '../../../../lib/public-notes';

/**
 * GET /api/v1/share/[...slug] - Check if note is public
 */
export const GET: APIRoute = async ({ params, cookies }) => {
  const { user } = await validateSession(cookies);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // params.slug is an array, join it back with /
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : (params.slug || '');
  const isPublic = await isNotePublic(slug);

  return new Response(JSON.stringify({
    success: true,
    data: { isPublic }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

/**
 * POST /api/v1/share/[...slug] - Make a note public
 */
export const POST: APIRoute = async ({ params, cookies, request }) => {
  try {
    const { user } = await validateSession(cookies);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // params.slug is an array, join it back with /
    const slug = Array.isArray(params.slug) ? params.slug.join('/') : (params.slug || '');

    // Get request body - may be empty
    let expiresAt: number | undefined;
    try {
      const body = await request.json();
      expiresAt = body.expiresAt;
    } catch {
      // No body or invalid JSON, expiresAt remains undefined
    }

    await makeNotePublic(slug, user.id, expiresAt);

    return new Response(JSON.stringify({
      success: true,
      message: 'Note is now public'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Share POST] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to share note'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * DELETE /api/v1/share/[...slug] - Make a note private
 */
export const DELETE: APIRoute = async ({ params, cookies }) => {
  const { user } = await validateSession(cookies);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // params.slug is an array, join it back with /
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : (params.slug || '');

  try {
    await makeNotePrivate(slug);

    return new Response(JSON.stringify({
      success: true,
      message: 'Note is now private'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to unshare note'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
