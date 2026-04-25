/**
 * Simple in-memory rate limiter.
 * For production, replace with Upstash Redis:
 * https://github.com/upstash/ratelimit
 */

interface RateLimitEntry {
  count:     number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  /** Max requests per window */
  limit:    number;
  /** Window in seconds */
  windowMs: number;
}

interface RateLimitResult {
  success:   boolean;
  remaining: number;
  resetTime: number;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { limit: 5, windowMs: 60 }
): RateLimitResult {
  const now = Date.now();
  const resetTime = now + options.windowMs * 1000;

  const entry = store.get(key);

  if (!entry || entry.resetTime < now) {
    // New window
    store.set(key, { count: 1, resetTime });
    return { success: true, remaining: options.limit - 1, resetTime };
  }

  if (entry.count >= options.limit) {
    return { success: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return {
    success:   true,
    remaining: options.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetTime < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}
