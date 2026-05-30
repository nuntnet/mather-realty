import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * lib/ratelimit.ts builds `authRateLimiter` at import time from env. We use
 * resetModules + per-test env stubbing + doMock to exercise both branches:
 *   - Upstash env unset  -> limiter is null -> checkAuthRateLimit is a no-op pass
 *   - Upstash env set     -> limiter is built -> delegates to Ratelimit.limit()
 */

beforeEach(() => {
  vi.resetModules();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.doUnmock("@upstash/ratelimit");
  vi.doUnmock("@upstash/redis");
});

describe("checkAuthRateLimit — disabled (no Upstash env)", () => {
  it("returns success:true and does not construct a limiter", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const mod = await import("@/lib/ratelimit");
    expect(mod.authRateLimiter).toBeNull();

    const result = await mod.checkAuthRateLimit("1.2.3.4");
    expect(result).toEqual({ success: true, limit: 0, remaining: 0, reset: 0 });
  });
});

describe("checkAuthRateLimit — enabled (Upstash configured)", () => {
  it("delegates to Ratelimit.limit() and returns its result", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token-123");

    const limitFn = vi.fn(async () => ({
      success: false,
      limit: 10,
      remaining: 0,
      reset: 123,
    }));

    vi.doMock("@upstash/redis", () => ({
      Redis: vi.fn(function () {
        return {};
      }),
    }));
    vi.doMock("@upstash/ratelimit", () => {
      const Ratelimit = vi.fn(function () {
        return { limit: limitFn };
      }) as unknown as { (): unknown; slidingWindow: ReturnType<typeof vi.fn> };
      Ratelimit.slidingWindow = vi.fn(() => "sliding-window-config");
      return { Ratelimit };
    });

    const mod = await import("@/lib/ratelimit");
    expect(mod.authRateLimiter).not.toBeNull();

    const result = await mod.checkAuthRateLimit("9.9.9.9");
    expect(limitFn).toHaveBeenCalledWith("9.9.9.9");
    expect(result).toEqual({ success: false, limit: 10, remaining: 0, reset: 123 });
  });
});
