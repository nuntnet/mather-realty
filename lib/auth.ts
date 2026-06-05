import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/lib/db/schema";

/**
 * Application roles:
 *   "admin"    — full platform access (manages all listings, users, analytics)
 *   "landlord" — owns property listings; can create/edit their own listings
 *   "user"     — authenticated tenant / regular visitor
 */
export type UserRole = "admin" | "landlord" | "user";

function createAuth() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.warn("[Auth] TURSO_DATABASE_URL not set — auth disabled");
    return null;
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3002",
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    plugins: [
      admin({
        // Extend Better Auth's admin plugin with the landlord role.
        // "admin" is the built-in privileged role; "landlord" and "user" are
        // stored verbatim in user.role and checked manually in requireLandlord.
        // The `as` cast satisfies the plugin's internal Role union type.
        defaultRole: "user" as const,
      }),
    ],
    trustedOrigins: [
      "http://localhost:3002",
      process.env.BETTER_AUTH_URL ?? "",
      // Vercel sets VERCEL_URL for every deployment (preview + production)
      // e.g. "double-n-realty-git-staging-nunt-s-projects.vercel.app"
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
      // Escape hatch: comma-separated list of extra origins in env
      ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map(s => s.trim()) ?? []),
    ].filter(Boolean),
  });
}

export const auth = createAuth();

export type Auth = NonNullable<typeof auth>;
