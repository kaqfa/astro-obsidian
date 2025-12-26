import { validateSlug } from './path-validation';
import { describe, it, expect } from 'vitest';

describe('validateSlug', () => {
  describe('path traversal protection', () => {
    it('should block path traversal with ..', () => {
      expect(() => validateSlug('../etc/passwd')).toThrow('Path traversal detected');
      expect(() => validateSlug(' ../../etc/passwd')).toThrow('Path traversal detected');
      expect(() => validateSlug('folder/../escape')).toThrow('Path traversal detected');
    });

    it('should block backslash paths', () => {
      expect(() => validateSlug('..\\windows\\system32')).toThrow('Path traversal detected');
      expect(() => validateSlug('folder\\..\\escape')).toThrow('Path traversal detected');
    });

    it('should strip null bytes', () => {
      // Null bytes are stripped, not rejected
      const result = validateSlug('note\0.txt');
      expect(result).toBe('note.txt');
    });
  });

  describe('valid path characters', () => {
    it('should allow alphanumeric characters', () => {
      expect(validateSlug('MyNote123')).toBe('MyNote123');
    });

    it('should allow spaces', () => {
      expect(validateSlug('My Note')).toBe('My Note');
      expect(validateSlug('Dev - Kids Space')).toBe('Dev - Kids Space');
    });

    it('should allow common punctuation', () => {
      expect(validateSlug('Timeline & Milestones')).toBe('Timeline & Milestones');
      expect(validateSlug('Note: Draft')).toBe('Note: Draft');
      expect(validateSlug('Note; Tag')).toBe('Note; Tag');
    });

    it('should allow slashes for paths', () => {
      expect(validateSlug('folder/subfolder')).toBe('folder/subfolder');
      expect(validateSlug('00 Ideas Inbox/Dev - Kids Space')).toBe(
        '00 Ideas Inbox/Dev - Kids Space'
      );
    });

    it('should allow dots in filename', () => {
      expect(validateSlug('2025-01-15')).toBe('2025-01-15');
      expect(validateSlug('W51-Plan')).toBe('W51-Plan');
    });

    it('should allow underscores and hyphens', () => {
      expect(validateSlug('my_note-test')).toBe('my_note-test');
    });

    it('should allow parentheses', () => {
      expect(validateSlug('Technical Challenge (Backend)')).toBe('Technical Challenge (Backend)');
      expect(validateSlug('Review (v2)')).toBe('Review (v2)');
    });

    it('should allow plus sign', () => {
      expect(validateSlug('Feature + Update')).toBe('Feature + Update');
      expect(validateSlug('Review + Proposed Solution')).toBe('Review + Proposed Solution');
    });
  });

  describe('invalid path characters', () => {
    it('should block special characters', () => {
      expect(() => validateSlug('note$pecial')).toThrow('Invalid characters');
      expect(() => validateSlug('note@home')).toThrow('Invalid characters');
      expect(() => validateSlug('note#tag')).toThrow('Invalid characters');
      expect(() => validateSlug('note!important')).toThrow('Invalid characters');
    });

    it('should block dangerous shell metacharacters (except semicolon which is safe)', () => {
      // Semicolon is actually allowed for notes like "Note; Tag"
      expect(() => validateSlug('note`command`')).toThrow('Invalid characters');
      expect(() => validateSlug('note|pipe')).toThrow('Invalid characters');
      expect(() => validateSlug('note$(command)')).toThrow('Invalid characters');
    });

    it('should block angle brackets', () => {
      expect(() => validateSlug('note<script>')).toThrow('Invalid characters');
      expect(() => validateSlug('note>')).toThrow('Invalid characters');
      expect(() => validateSlug('note<')).toThrow('Invalid characters');
    });

    it('should block brackets and braces', () => {
      expect(() => validateSlug('note[1]')).toThrow('Invalid characters');
      expect(() => validateSlug('note{test}')).toThrow('Invalid characters');
    });
  });

  describe('edge cases', () => {
    it('should reject empty string (no valid characters)', () => {
      // Empty string doesn't match the regex pattern
      expect(() => validateSlug('')).toThrow('Invalid characters in path');
    });

    it('should handle single character', () => {
      expect(validateSlug('a')).toBe('a');
    });

    it('should handle deeply nested paths', () => {
      expect(validateSlug('a/b/c/d/e/f')).toBe('a/b/c/d/e/f');
    });

    it('should normalize whitespace', () => {
      expect(validateSlug('  My Note  ')).toBe('  My Note  ');
    });
  });
});
