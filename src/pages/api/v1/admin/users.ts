import bcrypt from 'bcrypt';
import type { APIRoute } from 'astro';
import { getAllUsers, createUser } from '../../../../lib/api-keys';
import { requireAdminApiKey, createSuccessResponse, createErrorResponse } from '../../../../lib/api-utils';

/**
 * GET /api/v1/admin/users - List all users (admin only)
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    await requireAdminApiKey(request);
    const users = await getAllUsers();

    return createSuccessResponse(users, 200);
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to fetch users', 500);
  }
};

/**
 * POST /api/v1/admin/users - Create a new user (admin only)
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    await requireAdminApiKey(request);
    const body = await request.json();
    const { username, password, role = 'user' } = body;

    if (!username || !password) {
      return createErrorResponse('Missing required fields', 400);
    }

    if (role !== 'admin' && role !== 'user') {
      return createErrorResponse('Invalid role', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser(username, passwordHash, role);

    return createSuccessResponse({ id: userId, username, role }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to create user', 500);
  }
};
