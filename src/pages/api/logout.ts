import type { APIRoute } from "astro";
import { lucia } from "../../lib/auth";
import { validateSession } from "../../lib/middleware";

export const POST: APIRoute = async ({ cookies }) => {
  const { session } = await validateSession(cookies);

  if (session) {
    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  return new Response(null, {
    status: 302,
    headers: { Location: "/login" }
  });
};
