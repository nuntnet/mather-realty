import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter for /api/auth/* endpoints.
 *
 * Backed by Upstash Redis. If UPSTASH_REDIS_REST_URL / _TOKEN are not set,
 * `authRateLimiter` is null and callers should gracefully skip rate limiting.
 */
function createAuthRateLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "[RateLimit] UPSTASH_REDIS_REST_URL/TOKEN not set — auth rate limiting disabled"
    );
    return null;
  }

  const redis = new Redis({ url, token });

  return new Ratelimit({
    redis,
    // 10 requests per minute per IP for auth endpoints
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: false,
    prefix: "ratelimit:auth",
  });
}

export const authRateLimiter = createAuthRateLimiter();

/**
 * Check rate limit for the given identifier (usually client IP).
 * Returns `{ success: true }` (allowed) when limiting is disabled.
 */
export async function checkAuthRateLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (!authRateLimiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
  return authRateLimiter.limit(identifier);
}
