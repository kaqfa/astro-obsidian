import type { APIRoute } from 'astro';
import { validateApiKey } from '../../../../lib/api-keys';
import { getAllNotes } from '../../../../lib/vault';

/**
 * GET /api/v1/notes - List all notes
 * Requires: API Key authentication
 */
export const GET: APIRoute = async ({ request }) => {
  // Check API key
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing API key' }), {
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

  try {
    const notes = await getAllNotes();

    // Return lightweight data (no content)
    const lightweight = notes.map(note => ({
      slug: note.slug,
      title: note.title,
      path: note.path,
      lastModified: note.lastModified.toISOString(),
      frontmatter: note.frontmatter
    }));

    return new Response(JSON.stringify({
      success: true,
      data: lightweight,
      count: lightweight.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to fetch notes'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
