import { cookies } from "next/headers";
import { createHash } from "node:crypto";

export const SESSION_COOKIE = "a_share_ai_session";

export function sessionToken() {
  const password = process.env.APP_ACCESS_PASSWORD ?? "change-me";
  const secret = process.env.SESSION_SECRET ?? "dev-session-secret";

  return createHash("sha256").update(`${password}:${secret}`).digest("hex");
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === sessionToken();
}
