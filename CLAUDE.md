# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Obsidian Web Viewer is a self-hosted, single-user web application for viewing Obsidian vaults with Git synchronization. Built with Astro (SSR mode), React for interactive islands, and Tailwind CSS v4 for modern dark/light UI.

**Key characteristics:** Read-only access, SPA-style navigation, edge-compatible database (Turso/LibSQL), multiple deployment options (Passenger/cPanel, Docker, PM2).

---

## Common Commands

### Development

```bash
npm run dev              # Start dev server (localhost:4321)
npm run build            # Build for production
npm run build:check      # Build with type checking
npm run preview          # Preview production build
npm run typecheck        # Run Astro type checker
```

### Database Setup

```bash
npx tsx migrate.ts       # Create database tables
npx tsx setup.ts         # Create admin user (interactive)
```

### Deployment (Choose one)

```bash
# Passenger (cPanel)
# Upload dist/ + src/ + app.mjs, run via cPanel Node.js App

# Docker
docker-compose up -d
docker exec -it obsidian-web npx tsx migrate.ts
docker exec -it obsidian-web npx tsx setup.ts

# PM2
npm run build
pm2 start ecosystem.config.js
pm2 reload obsidian-web  # After code changes
```

---

## Architecture Overview

### Request Flow (SSR Mode)

```
Browser Request
    ↓
Astro SSR (Node adapter)
    ↓
validateSession() middleware → Lucia auth check
    ↓
Page Component (src/pages/*.astro)
    ├─ Server-side data fetching
    ├─ Markdown processing (unified pipeline)
    └─ React islands hydration (client:load)
    ↓
HTML Response + View Transitions metadata
```

### Caching Strategy (Performance Optimizations)

**Three-tier caching implemented (Dec 2024):**

1. **Global Layout Cache** (`src/integrations/cache-warming.ts`)
   - Pre-warmed on server startup
   - `globalFileTree` and `globalAllNotes` stored in-memory
   - Injected via `Astro.locals` to all requests
   - Refreshed after git sync via `refreshGlobalCache()`

2. **Markdown Cache** (`src/lib/markdown.ts`)
   - LRU Map with 500 entries, 30min TTL
   - Keyed by note slug
   - Cached HTML from unified pipeline
   - Invalidated on sync

3. **HTTP Browser Cache** (response headers)
   - Notes: `private, max-age=300, stale-while-revalidate=600`
   - Dashboard: `private, max-age=60, stale-while-revalidate=120`

**Important:** After modifying vault files via sync, all caches are invalidated and rebuilt.

### Core Libraries by Function

| Purpose             | Library                 | Location                       |
| ------------------- | ----------------------- | ------------------------------ |
| Authentication      | Lucia v3                | `src/lib/auth.ts`              |
| Database ORM        | Drizzle                 | `src/lib/db/`                  |
| Vault Operations    | fs/promises, simple-git | `src/lib/vault.ts`             |
| Markdown Processing | unified + remark/rehype | `src/lib/markdown.ts`          |
| Git Sync            | simple-git              | `src/lib/git.ts`               |
| Client Search       | FlexSearch              | `src/components/SearchBar.tsx` |

---

## Key Implementation Details

### Wikilink Resolution

Custom remark plugin in `src/lib/markdown.ts` transforms `[[note]]` or `[[note|alias]]` into proper links.

**Resolution strategy (in order):**

1. Exact match: `cache.get(linkLower)`
2. Basename only: `cache.get(basenameLower)` (e.g., "W51-Plan" → "Weekly/2025/W51-Plan")
3. With .md removed: `cache.get(withoutExtLower)`
4. Partial paths for nested structures

Uses `buildFilePathCache()` from `src/lib/vault.ts` which builds case-insensitive mappings.

### Markdown Processing Pipeline

````
markdown content
    ↓
remarkParse (Markdown → AST)
    ↓
remarkGfm (GitHub Flavored Markdown)
    ↓
remarkWikilinks (custom - transform [[links]])
    ↓
remarkMermaid (```mermaid → <pre class="mermaid">)
    ↓
remarkExcalidraw (```excalidraw → embed div)
    ↓
remarkRehype (MD AST → HTML AST)
    ↓
rehypeRaw (allow HTML in markdown)
    ↓
rehypeSlug (add IDs to headings)
    ↓
rehypeAutolinkHeadings (anchor links)
    ↓
rehypeHighlight (syntax highlighting)
    ↓
rehypeCopyButton (inject copy buttons)
    ↓
rehypeStringify (AST → HTML string)
````

### SPA Navigation with View Transitions

- **Server:** Astro generates HTML with `<transition:persist>` directives
- **Client:** `<script>` blocks listen for `astro:page-load` event
- **Re-render triggers:** Mermaid diagrams, Excalidraw embeds, copy button handlers

### Database Schema

**Tables** (`src/lib/db/schema.ts`):

- `user` - id, username, passwordHash
- `session` - id, userId, expiresAt

**Connection** (`src/lib/db/index.ts`):

- Uses `@libsql/client` (Turso or local SQLite)
- Drizzle ORM for type-safe queries
- Lucia adapter: `@lucia-auth/adapter-drizzle`

---

## Environment Variables

```bash
# Database (required)
TURSO_DATABASE_URL=file:local.db           # Local dev
# TURSO_DATABASE_URL=libsql://...turso.io  # Turso Cloud
TURSO_AUTH_TOKEN=xxx                       # Only for Turso

# Git Vault (required)
GIT_REPO_URL=https://github.com/user/vault.git
GIT_USERNAME=xxx                           # For private repos
GIT_TOKEN=xxx                              # Personal access token

# Optional
NODE_ENV=production
```

---

## Styling System

**Tailwind CSS v4** with custom theme in `src/styles/global.css`.

**Color Palette (Blue Topaz-inspired):**

- Dark mode (default): `#0f172a` (bg), `#3b82f6` (accent)
- Light mode: `#f8fafc` (bg), `#3b82f6` (accent)

**Theme persistence:** localStorage, system preference detection on first load.

---

## File Structure Notes

```
src/
├── components/          # React interactive components (client:load)
│   ├── SearchBar.tsx   # FlexSearch-based search
│   ├── ThemeToggle.tsx # Dark/light mode switcher
│   └── FileTree.astro  # Recursive folder tree (server-rendered)
├── layouts/
│   ├── MainLayout.astro      # Base layout + theme initialization
│   └── DashboardLayout.astro # App shell with sidebar
├── lib/
│   ├── auth.ts         # Lucia session management
│   ├── db/             # Drizzle schema + client
│   ├── git.ts          # Git pull operations
│   ├── markdown.ts     # Unified pipeline + wikilinks
│   ├── vault.ts        # File operations + cache warming
│   └── middleware.ts   # Session validation
├── pages/
│   ├── api/            # API endpoints (logout, sync)
│   ├── login.astro     # Login page
│   ├── index.astro     # Dashboard
│   └── notes/[...slug].astro  # Dynamic note routes
└── integrations/
    └── cache-warming.ts  # Server startup cache initialization
```

---

## Important Patterns

### Server-Side Data Fetching in Astro

```astro
---
const tree = Astro.locals.fileTree || await getFileTree();
---
```

Always check `Astro.locals` first before fetching - data may be pre-cached.

### Adding New Markdown Plugins

1. Create remark/rehype plugin function
2. Add to pipeline in `src/lib/markdown.ts` `processMarkdown()`
3. If client-side rendering needed, add `astro:page-load` listener in layout

### After Git Sync

All caches are invalidated:

1. `invalidateCaches()` - clears vault-level caches
2. `invalidateMarkdownCache()` - clears HTML cache
3. `warmCaches()` - rescans vault
4. `refreshGlobalCache()` - rebuilds Astro.locals data

---

## Known Issues & Workarounds

### Wikilink Resolution in Complex Vaults

Some nested structures may not resolve correctly. Check `buildFilePathCache()` resolution strategies if links break.

### Mermaid Re-render on Navigation

Diagrams use `astro:page-load` event listener - must re-run `mermaid.run()` after SPA navigation.

### Excalidraw External CDN

Embeds load from `excalidraw.com` - requires internet access.

---

## Testing

No automated tests currently. Manual testing checklist:

- [ ] Login/logout flow
- [ ] Note navigation (wikilinks work)
- [ ] Search functionality
- [ ] Git sync (public and private repos)
- [ ] Theme toggle persistence
- [ ] Mobile responsiveness

---

## Performance Targets

| Metric                         | Target             |
| ------------------------------ | ------------------ |
| Initial page load              | <2s                |
| SPA navigation                 | <200ms (perceived) |
| Search response                | <200ms             |
| Markdown cache hit             | <10ms              |
| Sync operation (typical vault) | <10s               |
