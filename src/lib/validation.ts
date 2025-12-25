import { z } from 'zod';

/**
 * Common validation schemas
 */
export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters');

export const noteSlugSchema = z.string()
  .min(1, 'Note slug cannot be empty')
  .max(500, 'Note slug too long')
  .refine(slug => !slug.includes('..'), 'Path traversal detected')
  .refine(slug => !slug.includes('\\'), 'Invalid path characters');

export const apiKeyNameSchema = z.string()
  .min(1, 'API key name is required')
  .max(100, 'API key name too long')
  .regex(/^[a-zA-Z0-9 _-]+$/, 'API key name contains invalid characters');

export const userRoleSchema = z.enum(['admin', 'user'], {
  errorMap: () => ({ message: 'Role must be either admin or user' })
});

/**
 * Request body schemas for API endpoints
 */
export const createApiKeySchema = z.object({
  name: apiKeyNameSchema
});

export const createUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  role: userRoleSchema.optional().default('user')
});

export const updateUserRoleSchema = z.object({
  role: userRoleSchema
});

export const shareNoteSchema = z.object({
  slug: noteSlugSchema,
  expiresAt: z.number().int().positive().optional().nullable()
});

/**
 * Helper function to validate request body
 * Returns parsed data or throws validation error
 */
export async function validateBody<T>(request: Request, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new Error(firstError.message);
    }
    throw error;
  }
}
