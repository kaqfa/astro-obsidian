import type { APIRoute } from 'astro';
import { validateSession } from '../../../../../lib/middleware';
import { generateApiKey, getUserApiKeys } from '../../../../../lib/api-keys';

/**
 * GET /api/v1/me/keys - List user's API keys
 */
export const GET: APIRoute = async ({ cookies }) => {
  const { user } = await validateSession(cookies);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const keys = await getUserApiKeys(user.id);

    // Don't expose the actual hashed keys
    const sanitized = keys.map(k => ({
      id: k.id.substring(0, 10) + '...', // Show partial
      name: k.name,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      isActive: k.isActive
    }));

    return new Response(JSON.stringify({
      success: true,
      data: sanitized
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to fetch API keys'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * POST /api/v1/me/keys - Generate a new API key
 */
export const POST: APIRoute = async ({ cookies, request }) => {
  const { user } = await validateSession(cookies);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rawKey = await generateApiKey(user.id, name);

    return new Response(JSON.stringify({
      success: true,
      data: { key: rawKey, name }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate API key'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
