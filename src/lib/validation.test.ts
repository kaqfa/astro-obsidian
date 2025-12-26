import {

  usernameSchema,
  passwordSchema,
  noteSlugSchema,
  apiKeyNameSchema,
  userRoleSchema,
  createUserSchema,
  shareNoteSchema,
} from './validation';
import { describe, it, expect } from 'vitest';
import {
  usernameSchema,
  passwordSchema,
  noteSlugSchema,
  apiKeyNameSchema,
  userRoleSchema,
  createUserSchema,
  shareNoteSchema,
} from './validation';
import { describe, it, expect } from 'vitest';
import {
  usernameSchema,
  passwordSchema,
  noteSlugSchema,
  apiKeyNameSchema,
  userRoleSchema,
  createUserSchema,
  shareNoteSchema,
} from './validation';
import { describe, it, expect } from 'vitest';

describe('validation schemas', () => {
  describe('usernameSchema', () => {
    it('should accept valid usernames', () => {
      expect(usernameSchema.parse('user123')).toBe('user123');
      expect(usernameSchema.parse('test_user')).toBe('test_user');
      expect(usernameSchema.parse('User-Name')).toBe('User-Name');
    });

    it('should reject usernames that are too short', () => {
      expect(() => usernameSchema.parse('ab')).toThrow();
    });

    it('should reject usernames that are too long', () => {
      expect(() => usernameSchema.parse('a'.repeat(51))).toThrow();
    });

    it('should reject usernames with invalid characters', () => {
      expect(() => usernameSchema.parse('user@name')).toThrow();
      expect(() => usernameSchema.parse('user name')).toThrow();
      expect(() => usernameSchema.parse('user.name')).toThrow();
    });
  });

  describe('passwordSchema', () => {
    it('should accept valid passwords', () => {
      expect(passwordSchema.parse('password123')).toBe('password123');
      expect(passwordSchema.parse('P@ssw0rd!')).toBe('P@ssw0rd!');
    });

    it('should reject passwords that are too short', () => {
      expect(() => passwordSchema.parse('pass')).toThrow();
    });

    it('should reject passwords that are too long', () => {
      expect(() => passwordSchema.parse('a'.repeat(101))).toThrow();
    });
  });

  describe('noteSlugSchema', () => {
    it('should accept valid slugs', () => {
      expect(noteSlugSchema.parse('my-note')).toBe('my-note');
      expect(noteSlugSchema.parse('folder/note')).toBe('folder/note');
      expect(noteSlugSchema.parse('My Note (Draft)')).toBe('My Note (Draft)');
    });

    it('should reject empty slugs', () => {
      expect(() => noteSlugSchema.parse('')).toThrow();
    });

    it('should reject slugs that are too long', () => {
      expect(() => noteSlugSchema.parse('a'.repeat(501))).toThrow();
    });

    it('should reject path traversal attempts', () => {
      expect(() => noteSlugSchema.parse('../escape')).toThrow();
      expect(() => noteSlugSchema.parse('..\\windows')).toThrow();
    });
  });

  describe('apiKeyNameSchema', () => {
    it('should accept valid names', () => {
      expect(apiKeyNameSchema.parse('My API Key')).toBe('My API Key');
      expect(apiKeyNameSchema.parse('Test-Key_123')).toBe('Test-Key_123');
    });

    it('should reject empty names', () => {
      expect(() => apiKeyNameSchema.parse('')).toThrow();
    });

    it('should reject names that are too long', () => {
      expect(() => apiKeyNameSchema.parse('a'.repeat(101))).toThrow();
    });

    it('should reject invalid characters', () => {
      expect(() => apiKeyNameSchema.parse('key@home')).toThrow();
      expect(() => apiKeyNameSchema.parse('key#tag')).toThrow();
    });
  });

  describe('userRoleSchema', () => {
    it('should accept valid roles', () => {
      expect(userRoleSchema.parse('admin')).toBe('admin');
      expect(userRoleSchema.parse('user')).toBe('user');
    });

    it('should reject invalid roles', () => {
      expect(() => userRoleSchema.parse('superadmin')).toThrow();
      expect(() => userRoleSchema.parse('moderator')).toThrow();
    });
  });

  describe('createUserSchema', () => {
    it('should accept valid user data', () => {
      const result = createUserSchema.parse({
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      expect(result).toEqual({
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
    });

    it('should use default role if not provided', () => {
      const result = createUserSchema.parse({
        username: 'testuser',
        password: 'password123',
      });
      expect(result.role).toBe('user');
    });

    it('should reject invalid username', () => {
      expect(() =>
        createUserSchema.parse({
          username: 'ab',
          password: 'password123',
        })
      ).toThrow();
    });

    it('should reject invalid password', () => {
      expect(() =>
        createUserSchema.parse({
          username: 'testuser',
          password: 'pass',
        })
      ).toThrow();
    });

    it('should reject invalid role', () => {
      expect(() =>
        createUserSchema.parse({
          username: 'testuser',
          password: 'password123',
          role: 'superadmin',
        })
      ).toThrow();
    });
  });

  describe('shareNoteSchema', () => {
    it('should accept valid share data', () => {
      const result = shareNoteSchema.parse({
        slug: 'my-note',
        expiresAt: Date.now() + 3600000,
      });
      expect(result.slug).toBe('my-note');
      expect(result.expiresAt).toBeDefined();
    });

    it('should accept null expiresAt (no expiration)', () => {
      const result = shareNoteSchema.parse({
        slug: 'my-note',
        expiresAt: null,
      });
      expect(result.expiresAt).toBeNull();
    });

    it('should accept omitting expiresAt', () => {
      const result = shareNoteSchema.parse({
        slug: 'my-note',
      });
      expect(result.expiresAt).toBeUndefined();
    });

    it('should reject path traversal in slug', () => {
      expect(() =>
        shareNoteSchema.parse({
          slug: '../escape',
        })
      ).toThrow();
    });

    it('should reject negative expiresAt', () => {
      expect(() =>
        shareNoteSchema.parse({
          slug: 'my-note',
          expiresAt: -1,
        })
      ).toThrow();
    });
  });
});
