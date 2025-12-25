import { join, normalize, relative } from 'path';

const VAULT_PATH = './vault';

/**
 * Validate that a slug doesn't escape the vault directory
 * Throws Error if path traversal detected
 */
export function validateSlug(slug: string): string {
  // Remove null bytes
  const cleanSlug = slug.replace(/\0/g, '');

  // Check for path traversal patterns
  if (cleanSlug.includes('..') || cleanSlug.includes('\\')) {
    throw new Error('Path traversal detected');
  }

  // Normalize and verify path stays within vault
  const fullPath = join(VAULT_PATH, `${cleanSlug}.md`);
  const normalizedPath = normalize(fullPath);
  const relativePath = relative(VAULT_PATH, normalizedPath);

  if (relativePath.startsWith('..')) {
    throw new Error('Path escapes vault directory');
  }

  // Only allow safe characters: alphanumeric, spaces, common punctuation, slashes, dots, parentheses
  // Allowed: letters, numbers, spaces, hyphens, underscores, slashes, dots, parentheses
  // Common punctuation: & (ampersand), , (comma), : (colon), ; (semicolon), ( and )
  // Examples: "Timeline & Milestones", "Note: Draft", "00 Ideas Inbox/Dev - Kids Space", "Technical Challenge (Backend)"
  // Note: hyphen placed at end to avoid being interpreted as range
  if (!/^[a-zA-Z0-9_\/.\s&,:;()-]+$/.test(cleanSlug)) {
    throw new Error('Invalid characters in path');
  }

  return cleanSlug;
}
