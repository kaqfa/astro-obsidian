import { db } from './db/index';
import { publicNotesTable, userTable } from './db/schema';
import { eq } from 'drizzle-orm';

export interface PublicNote {
  slug: string;
  sharedBy: string;
  sharedAt: number;
  expiresAt: number | null;
}

/**
 * Check if a note is publicly accessible
 */
export async function isNotePublic(slug: string): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(publicNotesTable)
      .where(eq(publicNotesTable.slug, slug))
      .get();

    if (!result) return false;

    // Check expiry
    if (result.expiresAt) {
      return Date.now() < result.expiresAt;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Add a note to public sharing
 */
export async function makeNotePublic(slug: string, sharedBy: string, expiresAt?: number): Promise<void> {
  await db.insert(publicNotesTable).values({
    slug,
    sharedBy,
    sharedAt: Date.now(),
    expiresAt: expiresAt || null
  }).onConflictDoUpdate({
    target: publicNotesTable.slug,
    set: {
      sharedBy,
      sharedAt: Date.now(),
      expiresAt: expiresAt || null
    }
  });
}

/**
 * Remove a note from public sharing
 */
export async function makeNotePrivate(slug: string): Promise<void> {
  await db.delete(publicNotesTable)
    .where(eq(publicNotesTable.slug, slug));
}

/**
 * Get all public notes shared by a user
 */
export async function getPublicNotesByUser(sharedBy: string): Promise<PublicNote[]> {
  const results = await db
    .select()
    .from(publicNotesTable)
    .where(eq(publicNotesTable.sharedBy, sharedBy));

  return results || [];
}

/**
 * Get all public notes (admin only)
 */
export async function getAllPublicNotes(): Promise<PublicNote[]> {
  const results = await db
    .select()
    .from(publicNotesTable);

  return results || [];
}
