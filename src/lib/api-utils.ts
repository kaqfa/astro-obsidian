import type { AstroCookies } from 'astro';
import { validateApiKey, isAdmin } from './api-keys';
import { validateSession } from './middleware';

export interface ApiAuth {
  userId: string;
  role: 'admin' | 'user';
}

export interface User {
  id: string;
  username: string;
}

// Response helpers
export function createErrorResponse(message: string, status: number = 500): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function createSuccessResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// API key authentication
export async function requireApiKey(request: Request): Promise<ApiAuth> {
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  if (!apiKey) {
    throw new AuthError('Missing API key', 401);
  }

  const auth = await validateApiKey(apiKey);
  if (!auth) {
    throw new AuthError('Invalid API key', 401);
  }

  return auth;
}

export async function requireAdminApiKey(request: Request): Promise<ApiAuth> {
  const auth = await requireApiKey(request);

  if (!(await isAdmin(auth.userId))) {
    throw new AuthError('Forbidden - Admin only', 403);
  }

  return auth;
}

// Session authentication
export async function requireSession(cookies: AstroCookies): Promise<User> {
  const { user } = await validateSession(cookies);

  if (!user) {
    throw new AuthError('Unauthorized', 401);
  }

  return user;
}

// Slug parameter processor
export function processSlugParam(params: Record<string, string | string[] | undefined>): string {
  const slug = params.slug;
  return Array.isArray(slug) ? slug.join('/') : slug || '';
}

// Custom error class for authentication failures
export class AuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Wrapper to handle auth errors in API routes
export function handleApiErrors(handler: () => Promise<Response>): Promise<Response> {
  return handler().catch((error) => {
    if (error instanceof AuthError) {
      return createErrorResponse(error.message, error.status);
    }
    console.error('[API] Unexpected error:', error);
    return createErrorResponse(error?.message || 'Internal server error', 500);
  });
}
