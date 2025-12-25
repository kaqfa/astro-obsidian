import type { APIRoute } from 'astro';
import { validateApiKey } from '../../../../lib/api-keys';
import { getNote } from '../../../../lib/vault';
import { isNotePublic } from '../../../../lib/public-notes';

/**
 * GET /api/v1/notes/[slug] - Get a specific note
 * Requires: API key authentication OR note is public
 */
export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const note = await getNote(slug);

  if (!note) {
    return new Response(JSON.stringify({ error: 'Note not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check if note is public or user has valid API key
  const isPublic = await isNotePublic(slug);

  if (!isPublic) {
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const auth = await validateApiKey(apiKey);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({
    success: true,
    data: {
      slug: note.slug,
      title: note.title,
      path: note.path,
      content: note.content,
      frontmatter: note.frontmatter,
      lastModified: note.lastModified.toISOString()
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': isPublic ? 'public, max-age=300' : 'private, max-age=60'
    }
  });
};
