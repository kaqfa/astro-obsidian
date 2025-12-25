import type { APIRoute } from 'astro';
import { validateApiKey, isAdmin, updateUserRole, deleteUser } from '../../../../../lib/api-keys';

/**
 * PATCH /api/v1/admin/users/[userId] - Update user role (admin only)
 */
export const PATCH: APIRoute = async ({ params, request }) => {
  const { userId } = params;
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  const auth = await validateApiKey(apiKey);
  if (!auth || !(await isAdmin(auth.userId))) {
    return new Response(JSON.stringify({ error: 'Forbidden - Admin only' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { role } = body;

    if (role !== 'admin' && role !== 'user') {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const success = await updateUserRole(userId, role);

    if (!success) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: { id: userId, role }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to update user'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * DELETE /api/v1/admin/users/[userId] - Delete user (admin only)
 */
export const DELETE: APIRoute = async ({ params, request }) => {
  const { userId } = params;
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  const auth = await validateApiKey(apiKey);
  if (!auth || !(await isAdmin(auth.userId))) {
    return new Response(JSON.stringify({ error: 'Forbidden - Admin only' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const success = await deleteUser(userId);

    if (!success) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'User deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to delete user'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
