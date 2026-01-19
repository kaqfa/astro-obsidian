import type { AstroCookies } from 'astro';
import { lucia } from './auth';
import { logger } from './logger';

export async function validateSession(cookies: AstroCookies) {
  const sessionCookie = cookies.get(lucia.sessionCookieName);

  logger.debug(`[MIDDLEWARE] Cookie check:`, {
    cookieName: lucia.sessionCookieName,
    hasCookie: !!sessionCookie,
    cookieValue: sessionCookie?.value?.substring(0, 10) + '...' || 'none',
  });

  const sessionId = sessionCookie?.value ?? null;

  if (!sessionId) {
    logger.debug('[MIDDLEWARE] No session ID found in cookie');
    return { user: null, session: null };
  }

  logger.debug('[MIDDLEWARE] Validating session from database...');
  const result = await lucia.validateSession(sessionId);

  logger.debug(`[MIDDLEWARE] Validation result:`, {
    sessionValid: !!result.session,
    userFound: !!result.user,
    userId: result.user?.id || 'none',
  });

  if (result.session?.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    logger.debug('[MIDDLEWARE] Fresh session detected, cookie refreshed');
  }

  if (!result.session) {
    const blankCookie = lucia.createBlankSessionCookie();
    cookies.set(blankCookie.name, blankCookie.value, blankCookie.attributes);
    logger.debug('[MIDDLEWARE] Invalid session, set blank cookie');
  }

  return result;
}
