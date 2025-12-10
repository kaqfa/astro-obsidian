import { lucia } from "./auth";
import type { AstroCookies } from "astro";

export async function validateSession(cookies: AstroCookies) {
  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  
  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);
  
  if (result.session?.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }
  
  if (!result.session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  return result;
}
