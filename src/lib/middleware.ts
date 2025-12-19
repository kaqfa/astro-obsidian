import { lucia } from "./auth";
import type { AstroCookies } from "astro";

export async function validateSession(cookies: AstroCookies) {
  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  
  console.log(`[MIDDLEWARE] Session ID from cookie: ${sessionId ? 'exists' : 'none'}`);
  
  if (!sessionId) {
    console.log('[MIDDLEWARE] No session ID found');
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);
  
  console.log(`[MIDDLEWARE] Session validation result:`, {
    session: result.session ? 'valid' : 'invalid',
    user: result.user ? { id: result.user.id, username: result.user.username } : null
  });
  
  if (result.session?.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    console.log('[MIDDLEWARE] Session refreshed');
  }
  
  if (!result.session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    console.log('[MIDDLEWARE] Invalid session, cleared cookie');
  }

  return result;
}
