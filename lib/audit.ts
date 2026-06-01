import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { auditLog } from "@/lib/db/schema";
import { desc, eq, and, gte } from "drizzle-orm";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client);
}

export type AuditAction = "create" | "update" | "delete" | "login" | "invite" | "ban" | "role_change";
export type AuditResource = "car" | "blog" | "user" | "promotion" | "appointment" | "feedback" | "story" | "video_review" | "social_link" | "service_content" | "insurance_partner";

export async function logAudit(opts: {
  userId: string;
  userName?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details?: Record<string, unknown>;
}) {
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(auditLog).values({
      userId: opts.userId,
      userName: opts.userName ?? null,
      action: opts.action,
      resource: opts.resource,
      resourceId: opts.resourceId ?? null,
      details: opts.details ? JSON.stringify(opts.details) : null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("[Audit] Failed to log:", err);
  }
}

export async function getAuditLogs(opts?: { days?: number; resource?: string; limit?: number }) {
  const db = getDb();
  if (!db) return [];
  const days = opts?.days ?? 30;
  const limit = opts?.limit ?? 100;
  const since = new Date(Date.now() - days * 86400000);

  const conditions = [gte(auditLog.createdAt, since)];
  if (opts?.resource) conditions.push(eq(auditLog.resource, opts.resource));

  return db.select().from(auditLog)
    .where(and(...conditions))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}
