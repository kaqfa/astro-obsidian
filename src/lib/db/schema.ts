import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// User roles: 'admin' | 'user'
export const userTable = sqliteTable('user', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'), // 'admin' | 'user'
  createdAt: integer('created_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0)
});

export const sessionTable = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer('expires_at').notNull()
});

// Public notes sharing - store slugs of notes that are publicly accessible
export const publicNotesTable = sqliteTable('public_notes', {
  slug: text('slug').primaryKey(), // note slug
  sharedBy: text('shared_by') // user id who shared it
    .notNull()
    .references(() => userTable.id),
  sharedAt: integer('shared_at').notNull().default(0),
  expiresAt: integer('expires_at'), // optional expiry (null = never expires)
});

// API keys for REST API access
export const apiKeysTable = sqliteTable('api_keys', {
  id: text('id').primaryKey(), // API key hash
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  name: text('name').notNull(), // Key name for identification
  createdAt: integer('created_at').notNull().default(0),
  lastUsedAt: integer('last_used_at'), // Last usage timestamp
  expiresAt: integer('expires_at'), // Optional expiry
  isActive: integer('is_active').notNull().default(1) // 0 = inactive, 1 = active
});

