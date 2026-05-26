import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : (process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  plugins: [inferAdditionalFields<typeof auth>()],
});

export async function getSessionUserId(): Promise<string | null> {
  const session = await authClient.getSession();
  return session.data?.user?.id ?? null;
}
