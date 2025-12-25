import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./db";
import { userTable, sessionTable } from "./db/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

// Debug: log environment for troubleshooting
console.log('[AUTH] Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  HTTPS: process.env.HTTPS,
  isProd: import.meta.env.PROD
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // For Passenger/cPanel: keep secure false unless explicitly HTTPS
      // Most shared hosting uses HTTP behind a proxy
      secure: false,
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
