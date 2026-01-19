import * as schema from './schema';
import { createClient } from '@libsql/client';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { logger } from '../logger';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

logger.info(`[DB] Connecting to database: ${url}`);

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });

// Test connection
client
  .execute('SELECT 1')
  .then(() => {
    logger.info('[DB] Database connection successful');
  })
  .catch((err) => {
    logger.error('[DB] Database connection failed:', err);
  });
