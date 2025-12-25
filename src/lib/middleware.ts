import { lucia } from "./auth";
import type { AstroCookies } from "astro";

export async function validateSession(cookies: AstroCookies) {
  const sessionCookie = cookies.get(lucia.sessionCookieName);

  console.log(`[MIDDLEWARE] Cookie check:`, {
    cookieName: lucia.sessionCookieName,
    hasCookie: !!sessionCookie,
    cookieValue: sessionCookie?.value?.substring(0, 10) + '...' || 'none'
  });

  const sessionId = sessionCookie?.value ?? null;

  if (!sessionId) {
    console.log('[MIDDLEWARE] No session ID found in cookie');
    return { user: null, session: null };
  }

  console.log('[MIDDLEWARE] Validating session from database...');
  const result = await lucia.validateSession(sessionId);

  console.log(`[MIDDLEWARE] Validation result:`, {
    sessionValid: !!result.session,
    userFound: !!result.user,
    userId: result.user?.id || 'none'
  });

  if (result.session?.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    console.log('[MIDDLEWARE] Fresh session detected, cookie refreshed');
  }

  if (!result.session) {
    const blankCookie = lucia.createBlankSessionCookie();
    cookies.set(blankCookie.name, blankCookie.value, blankCookie.attributes);
    console.log('[MIDDLEWARE] Invalid session, set blank cookie');
  }

  return result;
}
