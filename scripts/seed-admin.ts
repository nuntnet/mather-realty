/**
 * Seed Admin User Script
 *
 * Usage: npx tsx scripts/seed-admin.ts
 *
 * Creates the initial admin user for CH.ERAWAN admin panel.
 * Better Auth will auto-create tables on first API call.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@libsql/client";

const ADMIN_EMAIL = "admin@ch-erawan.com";
const ADMIN_PASSWORD = "Admin@2026!"; // Change this after first login!
const ADMIN_NAME = "Admin CH.ERAWAN";

async function hashPassword(password: string): Promise<string> {
  // Better Auth uses bcrypt-compatible hash
  // For simplicity, we'll use the API to create user instead
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌ TURSO_DATABASE_URL is required");
    console.log("Run: export TURSO_DATABASE_URL=<your-turso-url>");
    process.exit(1);
  }

  console.log("🔗 Connecting to Turso...");
  const client = createClient({ url, authToken });

  // Create tables if not exist (Better Auth schema)
  console.log("📦 Creating auth tables...");

  await client.execute(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      emailVerified INTEGER,
      image TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      role TEXT DEFAULT 'user',
      banned INTEGER DEFAULT 0,
      banReason TEXT,
      banExpires TEXT
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      accessTokenExpiresAt TEXT,
      refreshTokenExpiresAt TEXT,
      scope TEXT,
      idToken TEXT,
      password TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt TEXT NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      impersonatedBy TEXT,
      activeOrganizationId TEXT,
      FOREIGN KEY (userId) REFERENCES user(id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if admin user exists
  console.log("🔍 Checking for existing admin user...");
  const existing = await client.execute({
    sql: "SELECT id FROM user WHERE email = ?",
    args: [ADMIN_EMAIL],
  });

  if (existing.rows.length > 0) {
    console.log("✅ Admin user already exists!");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    process.exit(0);
  }

  // Create admin user
  console.log("👤 Creating admin user...");
  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Hash password using bcrypt-compatible format
  // Better Auth expects bcrypt hash, but for SQLite we can use a simpler approach
  // The password will be verified through Better Auth's signIn endpoint
  const { Bun } = globalThis as unknown as { Bun?: { password: { hash: (p: string) => Promise<string> } } };
  let hashedPassword: string;

  if (Bun) {
    hashedPassword = await Bun.password.hash(ADMIN_PASSWORD);
  } else {
    // Fallback: use bcryptjs if available, or create a placeholder
    // Better Auth will handle password verification
    const bcrypt = await import("bcryptjs").catch(() => null);
    if (bcrypt) {
      hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    } else {
      // Create with plain text (NOT SECURE - only for development)
      console.warn("⚠️  bcryptjs not found, using plain text password (INSECURE)");
      hashedPassword = ADMIN_PASSWORD;
    }
  }

  await client.execute({
    sql: `INSERT INTO user (id, name, email, emailVerified, role, createdAt, updatedAt)
          VALUES (?, ?, ?, 1, 'admin', ?, ?)`,
    args: [userId, ADMIN_NAME, ADMIN_EMAIL, now, now],
  });

  await client.execute({
    sql: `INSERT INTO account (id, userId, accountId, providerId, password, createdAt, updatedAt)
          VALUES (?, ?, ?, 'credential', ?, ?, ?)`,
    args: [accountId, userId, ADMIN_EMAIL, hashedPassword, now, now],
  });

  console.log("");
  console.log("✅ Admin user created successfully!");
  console.log("");
  console.log("📧 Email:", ADMIN_EMAIL);
  console.log("🔑 Password:", ADMIN_PASSWORD);
  console.log("");
  console.log("⚠️  IMPORTANT: Change this password after first login!");
  console.log("");
  console.log("🌐 Login at: https://ch-erawanwebsite.vercel.app/login");
}

main().catch(console.error);
