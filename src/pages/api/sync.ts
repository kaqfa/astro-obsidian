import type { APIRoute } from "astro";
import { validateSession } from "../../lib/middleware";
import { syncVault } from "../../lib/git";

export const POST: APIRoute = async ({ cookies }) => {
  const { user } = await validateSession(cookies);

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const result = await syncVault();

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 500,
    headers: { "Content-Type": "application/json" }
  });
};
