import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';

// Load environment variables
dotenv.config();

async function runMigration() {
  try {
    console.log('🚀 Running migrations...');

    // Get database configuration from environment
    const dbUrl = process.env.TURSO_DATABASE_URL || 'file:local.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;

    console.log(`📊 Database URL: ${dbUrl}`);

    // Create database client with environment config
    const client = createClient({
      url: dbUrl,
      authToken: authToken || undefined,
    });

    const db = drizzle(client);

    // Check if user table exists and its structure
    const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);
    const tableNames = tables?.rows?.map((r: any) => r.name) || [];
    console.log('📋 Existing tables:', tableNames);

    // Create/Update user table
    if (!tableNames.includes('user')) {
      console.log('📝 Creating user table (new)...');
      await db.run(sql`CREATE TABLE user (
        id TEXT NOT NULL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL DEFAULT 0
      )`);
    } else {
      console.log('📝 Updating user table (adding new columns)...');
      // Add new columns if they don't exist
      try {
        await db.run(sql`ALTER TABLE user ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
        console.log('  ✓ Added role column');
      } catch (e: any) {
        if (!e.message.includes('duplicate column')) console.error('  Warning:', e.message);
      }
      try {
        await db.run(sql`ALTER TABLE user ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0`);
        console.log('  ✓ Added created_at column');
      } catch (e: any) {
        if (!e.message.includes('duplicate column')) console.error('  Warning:', e.message);
      }
      try {
        await db.run(sql`ALTER TABLE user ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`);
        console.log('  ✓ Added updated_at column');
      } catch (e: any) {
        if (!e.message.includes('duplicate column')) console.error('  Warning:', e.message);
      }

      // Update existing users to have role='admin' if they're the first user
      const userCount = await db.run(sql`SELECT COUNT(*) as count FROM user`);
      const count = userCount?.rows?.[0]?.count || 0;
      if (count === 1) {
        await db.run(sql`UPDATE user SET role = 'admin' WHERE role IS NULL OR role = 'user'`);
        console.log('  ✓ Set first user as admin');
      }
    }

    // Create/Update session table
    if (!tableNames.includes('session')) {
      console.log('📝 Creating session table...');
      await db.run(sql`CREATE TABLE session (
        id TEXT NOT NULL PRIMARY KEY,
        expires_at INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id)
      )`);
    } else {
      console.log('📝 Session table already exists');
    }

    // Create public_notes table (new)
    if (!tableNames.includes('public_notes')) {
      console.log('📝 Creating public_notes table...');
      await db.run(sql`CREATE TABLE public_notes (
        slug TEXT NOT NULL PRIMARY KEY,
        shared_by TEXT NOT NULL,
        shared_at INTEGER NOT NULL DEFAULT 0,
        expires_at INTEGER,
        FOREIGN KEY (shared_by) REFERENCES user(id)
      )`);
    } else {
      console.log('📝 public_notes table already exists');
    }

    // Create api_keys table (new)
    if (!tableNames.includes('api_keys')) {
      console.log('📝 Creating api_keys table...');
      await db.run(sql`CREATE TABLE api_keys (
        id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT 0,
        last_used_at INTEGER,
        expires_at INTEGER,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES user(id)
      )`);
    } else {
      console.log('📝 api_keys table already exists');
    }

    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Migration failed!');
    console.error('Error details:', err.message);

    if (err.stack) {
      console.error('\nStack trace:');
      console.error(err.stack);
    }

    // Provide helpful error messages
    if (err.message?.includes('TURSO')) {
      console.error('\n💡 Hint: Check your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env file');
    } else if (err.message?.includes('SQLITE')) {
      console.error('\n💡 Hint: Make sure the database file path is accessible');
    }

    process.exit(1);
  }
}

runMigration();
