import type { APIRoute } from 'astro';
import { validateApiKey } from '../../../../lib/api-keys';
import { createErrorResponse } from '../../../../lib/api-utils';
import { isNotePublic } from '../../../../lib/public-notes';
import { getNote } from '../../../../lib/vault';

/**
 * GET /api/v1/notes/[slug] - Get a specific note
 * Requires: API key authentication OR note is public
 */
export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const note = await getNote(slug);

  if (!note) {
    return createErrorResponse('Note not found', 404);
  }

  // Check if note is public or user has valid API key
  const isPublicNote = await isNotePublic(slug);

  if (!isPublicNote) {
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
      return createErrorResponse('Authentication required', 401);
    }

    const auth = await validateApiKey(apiKey);
    if (!auth) {
      return createErrorResponse('Invalid API key', 401);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        slug: note.slug,
        title: note.title,
        path: note.path,
        content: note.content,
        frontmatter: note.frontmatter,
        lastModified: note.lastModified.toISOString(),
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': isPublicNote ? 'public, max-age=300' : 'private, max-age=60',
      },
    }
  );
};
