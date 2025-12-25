// Simple in-memory rate limiter for shared hosting environments
// No external dependencies required

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const attempts = new Map<string, RateLimitRecord>();

/**
 * Check if an identifier has exceeded rate limit
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param maxAttempts - Maximum attempts allowed within window
 * @param windowMs - Time window in milliseconds
 * @returns Object with success status and optional reset time
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): { success: boolean; resetAt?: Date } {
  const now = Date.now();
  const record = attempts.get(identifier);

  // No existing record or window expired - allow and reset counter
  if (!record || now > record.resetTime) {
    attempts.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  // Check if limit exceeded
  if (record.count >= maxAttempts) {
    return { success: false, resetAt: new Date(record.resetTime) };
  }

  // Increment counter
  record.count++;
  return { success: true };
}

/**
 * Clean up expired rate limit entries
 * Call this periodically (e.g., every hour) to prevent memory leaks
 */
export function cleanupRateLimits() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of attempts.entries()) {
    if (now > value.resetTime) {
      attempts.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[RATE-LIMIT] Cleaned up ${cleaned} expired entries`);
  }
}
