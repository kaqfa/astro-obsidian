import type { APIRoute } from 'astro';
import { validateApiKey, isAdmin, getAllUsers, createUser, updateUserRole, deleteUser } from '../../../../lib/api-keys';

/**
 * GET /api/v1/admin/users - List all users (admin only)
 */
export const GET: APIRoute = async ({ request }) => {
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

  // Check if user is admin
  if (!(await isAdmin(auth.userId))) {
    return new Response(JSON.stringify({ error: 'Forbidden - Admin only' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const users = await getAllUsers();

    return new Response(JSON.stringify({
      success: true,
      data: users
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to fetch users'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * POST /api/v1/admin/users - Create a new user (admin only)
 */
export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const auth = await validateApiKey(apiKey);
  if (!auth || !(await isAdmin(auth.userId))) {
    return new Response(JSON.stringify({ error: 'Forbidden - Admin only' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { username, password, role = 'user' } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (role !== 'admin' && role !== 'user') {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await createUser(username, passwordHash, role);

    return new Response(JSON.stringify({
      success: true,
      data: { id: userId, username, role }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create user'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
