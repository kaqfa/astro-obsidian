import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
// Load environment variables
import 'dotenv/config';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`[DB] Connecting to database: ${url}`);

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });

// Test connection
client.execute('SELECT 1').then(() => {
  console.log('[DB] Database connection successful');
}).catch(err => {
  console.error('[DB] Database connection failed:', err);
});
