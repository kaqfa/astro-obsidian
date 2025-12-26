import { db } from './db';
import { userTable, sessionTable } from './db/schema';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

// Detect if we're in a secure environment
function isSecureEnvironment(): boolean {
  // For cPanel/Passenger with SSL offloading (Cloudflare/proxy):
  // Browser connects via HTTPS but app sees HTTP
  // Set secure: false so cookies work correctly
  // The SSL is handled at the proxy level, so cookies are still secure in transit

  // Only set secure: true if explicitly configured
  // For most shared hosting with SSL offloading, this should be false
  if (process.env.FORCE_SECURE_COOKIE === 'true') return true;

  return false;
}

// Debug: log environment for troubleshooting
console.log('[AUTH] Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  HTTPS: process.env.HTTPS,
  FORCE_SECURE_COOKIE: process.env.FORCE_SECURE_COOKIE,
  isSecure: isSecureEnvironment(),
  isProd: import.meta.env.PROD,
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // For SSL offloading (Cloudflare, cPanel proxy), use secure: false
      // The proxy handles HTTPS, so cookies are still encrypted in transit
      secure: isSecureEnvironment(),
      // Use 'lax' for same-site, 'none' for cross-origin (mobile apps)
      // For typical web usage, 'lax' is more secure
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      username: string;
    };
  }
}

export { db };
