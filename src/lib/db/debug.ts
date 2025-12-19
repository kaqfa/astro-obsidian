import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import 'dotenv/config';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`[DB-DEBUG] Connecting to database: ${url}`);

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

// Test connection and check users
async function debugDatabase() {
  try {
    console.log('[DB-DEBUG] Testing database connection...');
    await client.execute('SELECT 1');
    console.log('[DB-DEBUG] Database connection successful');
    
    console.log('[DB-DEBUG] Checking if tables exist...');
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('[DB-DEBUG] Tables found:', tables.rows.map(row => row.name));
    
    console.log('[DB-DEBUG] Checking users in database...');
    const users = await db.select().from(schema.userTable);
    console.log(`[DB-DEBUG] Found ${users.length} users in database`);
    
    if (users.length > 0) {
      console.log('[DB-DEBUG] User details:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Password Hash: ${user.passwordHash ? 'exists' : 'missing'}`);
      });
    } else {
      console.log('[DB-DEBUG] No users found. You may need to run setup.ts to create a user.');
    }
    
  } catch (err) {
    console.error('[DB-DEBUG] Database error:', err);
  }
}

// Run debug if this file is executed directly
if (import.meta.main) {
  debugDatabase().then(() => process.exit(0));
}

export { debugDatabase };