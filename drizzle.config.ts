import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  // better-auth manages its own schema — no schema file needed for normal use
  // Uncomment if you add custom tables:
  // schema: "./lib/db/schema.ts",
  out: "./drizzle",
  verbose: true,
} satisfies Config;
