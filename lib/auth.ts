import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

function createAuth() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.warn("[Auth] TURSO_DATABASE_URL not set — auth disabled");
    return null;
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    plugins: [admin()],
    trustedOrigins: [
      "http://localhost:3000",
      process.env.BETTER_AUTH_URL ?? "",
    ].filter(Boolean),
  });
}

export const auth = createAuth();

export type Auth = NonNullable<typeof auth>;
