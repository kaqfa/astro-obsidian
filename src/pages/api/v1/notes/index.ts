import type { APIRoute } from 'astro';
import { requireApiKey, createErrorResponse } from '../../../../lib/api-utils';
import { getAllNotes } from '../../../../lib/vault';

/**
 * GET /api/v1/notes - List all notes
 * Requires: API Key authentication
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    await requireApiKey(request);

    const notes = await getAllNotes();

    // Return lightweight data (no content)
    const lightweight = notes.map((note) => ({
      slug: note.slug,
      title: note.title,
      path: note.path,
      lastModified: note.lastModified.toISOString(),
      frontmatter: note.frontmatter,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: lightweight,
        count: lightweight.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message || 'Failed to fetch notes', 500);
    }
    return createErrorResponse('Failed to fetch notes', 500);
  }
};
