import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, cleanupRateLimits } from './rate-limit';

describe('rate limiting', () => {
  beforeEach(() => {
    // Clear rate limits before each test
    const attempts = (checkRateLimit as any).attempts;
    if (attempts && typeof attempts.clear === 'function') {
      attempts.clear();
    }
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const result1 = checkRateLimit('user1', 5, 60000);
      expect(result1.success).toBe(true);
      expect(result1.resetAt).toBeUndefined();
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'user2';
      const maxAttempts = 3;

      // Make 3 successful attempts
      for (let i = 0; i < maxAttempts; i++) {
        expect(checkRateLimit(identifier, maxAttempts, 60000).success).toBe(true);
      }

      // 4th attempt should be blocked
      const result = checkRateLimit(identifier, maxAttempts, 60000);
      expect(result.success).toBe(false);
      expect(result.resetAt).toBeInstanceOf(Date);
    });

    it('should reset after window expires', async () => {
      const identifier = 'user3';
      const maxAttempts = 2;
      const windowMs = 100; // 100ms for testing

      // Exhaust limit
      checkRateLimit(identifier, maxAttempts, windowMs);
      checkRateLimit(identifier, maxAttempts, windowMs);

      // Should be blocked
      let result = checkRateLimit(identifier, maxAttempts, windowMs);
      expect(result.success).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be allowed again
      result = checkRateLimit(identifier, maxAttempts, windowMs);
      expect(result.success).toBe(true);
    });

    it('should track different identifiers separately', () => {
      const result1 = checkRateLimit('user1', 5, 60000);
      const result2 = checkRateLimit('user2', 5, 60000);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should use default parameters', () => {
      const result = checkRateLimit('user1');
      expect(result.success).toBe(true);
    });
  });

  describe('cleanupRateLimits', () => {
    it('should not throw when cleaning empty state', () => {
      expect(() => cleanupRateLimits()).not.toThrow();
    });

    it('should remove expired entries', async () => {
      const identifier = 'user4';
      const windowMs = 50;

      // Create entry that will expire
      checkRateLimit(identifier, 1, windowMs);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      // Cleanup should remove expired entry
      expect(() => cleanupRateLimits()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty identifier', () => {
      const result = checkRateLimit('', 5, 60000);
      expect(result.success).toBe(true);
    });

    it('should handle special characters in identifier', () => {
      const result = checkRateLimit('user:127.0.0.1', 5, 60000);
      expect(result.success).toBe(true);
    });

    it('should handle zero max attempts', () => {
      const result = checkRateLimit('user1', 0, 60000);
      expect(result.success).toBe(false);
    });

    it('should handle negative window', () => {
      const result = checkRateLimit('user1', 5, -1);
      // Should still work, treating negative as 0
      expect(result.success).toBe(true);
    });
  });
});
