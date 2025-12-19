import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

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
      authToken: authToken || undefined
    });
    
    const db = drizzle(client);
    
    // Create tables manually since we don't have migration files
    console.log('📝 Creating user table...');
    await db.run(sql`CREATE TABLE IF NOT EXISTS user (
      id TEXT NOT NULL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )`);

    console.log('📝 Creating session table...');
    await db.run(sql`CREATE TABLE IF NOT EXISTS session (
      id TEXT NOT NULL PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id)
    )`);

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
