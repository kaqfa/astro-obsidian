import type { APIRoute } from 'astro';
import { validateSession } from '../../../../../lib/middleware';
import { revokeApiKey } from '../../../../../lib/api-keys';

/**
 * DELETE /api/v1/me/keys/[keyId] - Revoke an API key
 */
export const DELETE: APIRoute = async ({ params, cookies }) => {
  const { user } = await validateSession(cookies);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { keyId } = params;

  try {
    const success = await revokeApiKey(keyId, user.id);

    if (!success) {
      return new Response(JSON.stringify({ error: 'API key not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'API key revoked'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to revoke API key'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
