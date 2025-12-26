import type { APIRoute } from 'astro';
import { generateApiKey, getUserApiKeys } from '../../../../../lib/api-keys';
import { requireSession, createSuccessResponse, createErrorResponse } from '../../../../../lib/api-utils';

/**
 * GET /api/v1/me/keys - List user's API keys
 */
export const GET: APIRoute = async ({ cookies }) => {
  try {
    const user = await requireSession(cookies);
    const keys = await getUserApiKeys(user.id);

    // Don't expose the actual hashed keys
    const sanitized = keys.map((k) => ({
      id: k.id.substring(0, 10) + '...', // Show partial
      name: k.name,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      isActive: k.isActive,
    }));

    return createSuccessResponse(sanitized);
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to fetch API keys', 500);
  }
};

/**
 * POST /api/v1/me/keys - Generate a new API key
 */
export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const user = await requireSession(cookies);
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return createErrorResponse('Name is required', 400);
    }

    const rawKey = await generateApiKey(user.id, name);

    return createSuccessResponse({ key: rawKey, name }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to generate API key', 500);
  }
};
