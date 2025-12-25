import type { FileTreeItem, Note } from './lib/vault';

declare namespace Astro {
  interface Locals {
    fileTree?: FileTreeItem[];
    allNotes?: Note[];
  }
}
