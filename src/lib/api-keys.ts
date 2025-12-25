import { db } from './db/index';
import { apiKeysTable, userTable } from './db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export type UserRole = 'admin' | 'user';

export interface ApiKeyInfo {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  lastUsedAt: number | null;
  expiresAt: number | null;
  isActive: number;
}

/**
 * Generate a new API key for a user
 * Returns the raw key (only shown once) - store hashed version in DB
 */
export async function generateApiKey(userId: string, name: string): Promise<string> {
  const rawKey = `obsk_${crypto.randomUUID().replace(/-/g, '')}`;
  const hashedKey = await bcrypt.hash(rawKey, 10);

  await db.insert(apiKeysTable).values({
    id: hashedKey,
    userId,
    name,
    createdAt: Date.now(),
    isActive: 1
  });

  return rawKey;
}

/**
 * Validate an API key and return user info if valid
 */
export async function validateApiKey(apiKey: string): Promise<{ userId: string; role: UserRole } | null> {
  if (!apiKey.startsWith('obsk_')) {
    return null;
  }

  // Get all active API keys and check with bcrypt
  const keys = await db
    .select()
    .from(apiKeysTable)
    .where(eq(apiKeysTable.isActive, 1));

  for (const key of keys) {
    if (await bcrypt.compare(apiKey, key.id)) {
      // Check expiry
      if (key.expiresAt && Date.now() > key.expiresAt) {
        return null;
      }

      // Update last used
      await db.update(apiKeysTable)
        .set({ lastUsedAt: Date.now() })
        .where(eq(apiKeysTable.id, key.id));

      // Get user role
      const user = await db
        .select({ role: userTable.role })
        .from(userTable)
        .where(eq(userTable.id, key.userId))
        .get();

      return {
        userId: key.userId,
        role: (user?.role as UserRole) || 'user'
      };
    }
  }

  return null;
}

/**
 * Get all API keys for a user
 */
export async function getUserApiKeys(userId: string): Promise<ApiKeyInfo[]> {
  const keys = await db
    .select()
    .from(apiKeysTable)
    .where(eq(apiKeysTable.userId, userId));

  return keys.map(k => ({
    id: k.id,
    userId: k.userId,
    name: k.name,
    createdAt: k.createdAt,
    lastUsedAt: k.lastUsedAt,
    expiresAt: k.expiresAt,
    isActive: k.isActive
  }));
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
  const result = await db
    .update(apiKeysTable)
    .set({ isActive: 0 })
    .where(and(
      eq(apiKeysTable.id, keyId),
      eq(apiKeysTable.userId, userId)
    ));

  return result.rowsAffected > 0;
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await db
    .select({ role: userTable.role })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .get();

  return user?.role === 'admin';
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const users = await db
    .select({
      id: userTable.id,
      username: userTable.username,
      role: userTable.role,
      createdAt: userTable.createdAt
    })
    .from(userTable);

  return users;
}

/**
 * Create a new user (admin only)
 */
export async function createUser(username: string, passwordHash: string, role: UserRole = 'user'): Promise<string> {
  const userId = crypto.randomUUID();

  await db.insert(userTable).values({
    id: userId,
    username,
    passwordHash,
    role,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  return userId;
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  const result = await db
    .update(userTable)
    .set({ role, updatedAt: Date.now() })
    .where(eq(userTable.id, userId));

  return result.rowsAffected > 0;
}

/**
 * Delete a user (admin only)
 */
export async function deleteUser(userId: string): Promise<boolean> {
  // Delete sessions first
  await db.delete(apiKeysTable).where(eq(apiKeysTable.userId, userId));
  // Then delete user
  const result = await db.delete(userTable).where(eq(userTable.id, userId));

  return result.rowsAffected > 0;
}
