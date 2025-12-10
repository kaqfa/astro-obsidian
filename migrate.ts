import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('🚀 Running migrations...');
  
  // Create tables manually since we don't have migration files
  await db.run(sql`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )`);

  await db.run(sql`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
  )`);

  console.log('✅ Migrations completed!');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
