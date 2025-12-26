import type { APIRoute } from 'astro';
import { revokeApiKey } from '../../../../../lib/api-keys';
import { requireSession, createSuccessResponse, createErrorResponse } from '../../../../../lib/api-utils';

/**
 * DELETE /api/v1/me/keys/[keyId] - Revoke an API key
 */
export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const user = await requireSession(cookies);
    const { keyId } = params;

    const success = await revokeApiKey(keyId, user.id);

    if (!success) {
      return createErrorResponse('API key not found', 404);
    }

    return createSuccessResponse({ message: 'API key revoked' });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to revoke API key', 500);
  }
};
