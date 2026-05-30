import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * requireAdmin() gate. Mocks `@/lib/auth` (the Better Auth instance) and
 * `next/headers` to simulate the four states:
 *   - auth not configured        -> 503
 *   - no session / not signed in  -> 401
 *   - signed in, non-admin role   -> 403
 *   - signed in admin             -> null (proceed)
 */

async function loadRequireAdmin(authValue: unknown) {
  vi.resetModules();
  vi.doMock("next/headers", () => ({
    headers: vi.fn(async () => new Headers()),
  }));
  vi.doMock("@/lib/auth", () => ({ auth: authValue }));
  const mod = await import("@/lib/admin-auth");
  return mod.requireAdmin;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.doUnmock("next/headers");
  vi.doUnmock("@/lib/auth");
});

describe("requireAdmin", () => {
  it("returns 503 when auth is not configured (Turso unset)", async () => {
    const requireAdmin = await loadRequireAdmin(null);
    const res = await requireAdmin();
    expect(res).not.toBeNull();
    expect(res!.status).toBe(503);
    await expect(res!.json()).resolves.toEqual({ error: "Authentication not configured" });
  });

  it("returns 401 when there is no session", async () => {
    const getSession = vi.fn(async () => null);
    const requireAdmin = await loadRequireAdmin({ api: { getSession } });
    const res = await requireAdmin();
    expect(res!.status).toBe(401);
    await expect(res!.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when getSession throws (caught -> null)", async () => {
    const getSession = vi.fn(async () => {
      throw new Error("db down");
    });
    const requireAdmin = await loadRequireAdmin({ api: { getSession } });
    const res = await requireAdmin();
    expect(res!.status).toBe(401);
  });

  it("returns 403 when the user is authenticated but not an admin", async () => {
    const getSession = vi.fn(async () => ({ user: { id: "u1", role: "user" } }));
    const requireAdmin = await loadRequireAdmin({ api: { getSession } });
    const res = await requireAdmin();
    expect(res!.status).toBe(403);
    await expect(res!.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("returns null (proceed) when the user is an admin", async () => {
    const getSession = vi.fn(async () => ({ user: { id: "u1", role: "admin" } }));
    const requireAdmin = await loadRequireAdmin({ api: { getSession } });
    const res = await requireAdmin();
    expect(res).toBeNull();
  });
});
