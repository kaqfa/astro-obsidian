import type { APIRoute } from 'astro';
import { updateUserRole, deleteUser } from '../../../../../lib/api-keys';
import { requireAdminApiKey, createSuccessResponse, createErrorResponse } from '../../../../../lib/api-utils';

/**
 * PATCH /api/v1/admin/users/[userId] - Update user role (admin only)
 */
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    await requireAdminApiKey(request);
    const { userId } = params;
    const body = await request.json();
    const { role } = body;

    if (role !== 'admin' && role !== 'user') {
      return createErrorResponse('Invalid role', 400);
    }

    const success = await updateUserRole(userId, role);

    if (!success) {
      return createErrorResponse('User not found', 404);
    }

    return createSuccessResponse({ id: userId, role });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to update user', 500);
  }
};

/**
 * DELETE /api/v1/admin/users/[userId] - Delete user (admin only)
 */
export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    await requireAdminApiKey(request);
    const { userId } = params;

    const success = await deleteUser(userId);

    if (!success) {
      return createErrorResponse('User not found', 404);
    }

    return createSuccessResponse({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('Failed to delete user', 500);
  }
};
