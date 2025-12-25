import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./db";
import { userTable, sessionTable } from "./db/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

// Detect if we're in a secure environment
function isSecureEnvironment(): boolean {
  // Check explicit environment variable
  if (process.env.HTTPS === 'true') return true;

  // Check NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    // For Passenger/cPanel: assume HTTPS unless explicitly disabled
    // Many shared hosts use SSL offloading at proxy level
    return process.env.FORCE_HTTPS !== 'false';
  }

  return false;
}

// Debug: log environment for troubleshooting
console.log('[AUTH] Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  HTTPS: process.env.HTTPS,
  FORCE_HTTPS: process.env.FORCE_HTTPS,
  isSecure: isSecureEnvironment(),
  isProd: import.meta.env.PROD
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // Auto-detect secure environment
      secure: isSecureEnvironment(),
      sameSite: "lax",
      path: "/",
      httpOnly: true
    }
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username
    };
  }
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      username: string;
    };
  }
}

export { db };
