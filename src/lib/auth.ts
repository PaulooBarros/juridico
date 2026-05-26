import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { sendPasswordResetEmail } from "./email";

function buildPool() {
  const raw = process.env.NEXT_PRIVATE_SUPABASE_CONNECTIONSTRING?.trim() ?? "";
  try {
    // new URL() misparses passwords containing [ or ] (treats as IPv6 delimiters).
    // Parse manually: split on last @ to separate userinfo from host.
    const protoEnd = raw.indexOf("://");
    const lastAt   = raw.lastIndexOf("@");
    const userinfo  = raw.slice(protoEnd + 3, lastAt);          // user:password
    const afterAt   = raw.slice(lastAt + 1);                    // host:port/db
    const slashIdx  = afterAt.indexOf("/");
    const hostPort  = afterAt.slice(0, slashIdx);               // host:port
    const database  = afterAt.slice(slashIdx + 1);              // db
    const colonIdx  = userinfo.indexOf(":");
    const user      = userinfo.slice(0, colonIdx);
    const password  = userinfo.slice(colonIdx + 1);             // raw, no decode
    const [host, portStr] = hostPort.split(":");

    console.log("[auth] pool →", { host, port: portStr, database, user, passwordLen: password.length });
    return new Pool({
      host,
      port:     portStr ? parseInt(portStr, 10) : 5432,
      database,
      user,
      password,
      ssl: { rejectUnauthorized: false },
    });
  } catch {
    return new Pool({ connectionString: raw, ssl: { rejectUnauthorized: false } });
  }
}

const pool = buildPool();

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  socialProviders: {
    google: {
      clientId:     process.env.NEXT_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  user: {
    additionalFields: {
      nome_profissional: { type: "string", nullable: true, defaultValue: null },
      oab:               { type: "string", nullable: true, defaultValue: null },
      bio:               { type: "string", nullable: true, defaultValue: null },
      areas_atuacao:     { type: "string", nullable: true, defaultValue: null },
      escritorio_id:     { type: "string", nullable: true, defaultValue: null },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.BETTER_AUTH_URL || "",
  ].filter(Boolean),
});
