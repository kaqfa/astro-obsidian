# Software Requirements Specification

## Obsidian Web Viewer

**Version:** 2.0  
**Date:** December 2024  
**Author:** Fahri Firdausillah

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini mendefinisikan functional dan non-functional requirements untuk Obsidian Web Viewer v2.0. Dokumen ini mencerminkan aplikasi yang sudah ter-implement dengan fitur modern UI, SPA experience, dan multiple deployment options.

### 1.2 Scope

Obsidian Web Viewer adalah aplikasi web self-hosted yang memberikan akses read-only terhadap vault Obsidian dengan:

- Modern SPA experience via Astro View Transitions
- Dark theme UI dengan Tailwind CSS v4
- Edge-compatible database (Turso/LibSQL)
- Code syntax highlighting dan Table of Contents
- Multiple deployment options (Passenger, Docker, PM2)

### 1.3 Document Conventions

- **FR**: Functional Requirement
- **NFR**: Non-Functional Requirement
- **Priority**: High (must-have), Medium (should-have), Low (nice-to-have)
- **Status**: ✅ Implemented, 🔄 In Progress, ⏳ Planned

---

## 2. Overall Description

### 2.1 Product Perspective

Obsidian Web Viewer v2.0 adalah standalone system yang berinteraksi dengan:

- **Git repository** (source of truth untuk vault)
- **Web browser** (modern SPA client)
- **File system** (local cache untuk vault)
- **Turso/LibSQL database** (authentication + edge-compatible)
- **Deployment platforms** (Passenger, Docker, atau PM2)

### 2.2 Technology Stack

| Component        | Technology                | Version |
| ---------------- | ------------------------- | ------- |
| Framework        | Astro                     | 5.16.4  |
| UI Library       | React                     | 18.3.1  |
| Styling          | Tailwind CSS              | 4.1.17  |
| Database         | Turso/Lib SQL             | Latest  |
| ORM              | Drizzle                   | 0.45.1  |
| Auth             | Lucia                     | 3.2.2   |
| Search           | FlexSearch                | 0.7.43  |
| Markdown         | unified + remark + rehype | Latest  |
| Syntax Highlight | rehype-highlight          | 7.0.2   |
| Diagrams         | Mermaid.js                | 11.4.0  |
| Git              | simple-git                | 3.27.0  |

### 2.3 Operating Environment

- **Server:** Node.js 18+ runtime
- **Database:** Turso Cloud atau local SQLite file
- **Client:** Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Network:** HTTP/HTTPS
- **Deployment:** cPanel (Passenger), VPS (Docker/PM2), atau cloud platforms

---

## 3. Functional Requirements

### 3.1 Authentication System

#### FR-1.1: User Login ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- Login form dengan username dan password fields
- Password hashing via bcrypt (10 rounds)
- Session creation via Lucia Auth
- Drizzle ORM untuk database queries
- Error handling untuk invalid credentials

**Acceptance Criteria:**

- ✅ User dapat login dengan valid credentials
- ✅ Password di-hash dengan bcrypt sebelum disimpan
- ✅ Session cookie secure flag enabled di production
- ✅ Error message "Username atau password salah" untuk gagal login

#### FR-1.2: Session Management ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- Lucia Auth v3 dengan Drizzle adapter
- Session validation middleware untuk protected routes
- 7-day session expiry
- Secure, HttpOnly cookies

**Acceptance Criteria:**

- ✅ Valid session dapat akses dashboard dan notes
- ✅ Expired session redirect ke login
- ✅ Session cookie secure di production

#### FR-1.3: User Logout ✅

**Priority:** Medium  
**Status:** ✅ Implemented

**Implementation:**

- POST `/api/logout` endpoint
- Session invalidation via Lucia
- Cookie deletion
- Redirect ke login page

---

### 3.2 Modern UI/UX

#### FR-2.1: SPA Experience ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- Astro View Transitions (ClientRouter)
- Persistent sidebar state via `transition:persist`
- Loading overlay during page transitions
- No full page reloads saat navigation

**Acceptance Criteria:**

- ✅ Navigation tanpa full page reload
- ✅ Sidebar scroll position maintained
- ✅ Loading indicator muncul saat transition
- ✅ Mermaid diagrams re-render setelah navigation

#### FR-2.2: Dark Theme UI ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- Tailwind CSS v4 dengan custom theme
- Dark color palette:
  - `--color-bg-primary`: #0f172a
  - `--color-bg-secondary`: #1e293b
  - `--color-accent`: #3b82f6
- Glassmorphism effects dengan backdrop-blur
- Google Fonts (Inter) untuk typography

**Acceptance Criteria:**

- ✅ Consistent dark theme across all pages
- ✅ High contrast untuk readability
- ✅ Smooth color transitions
- ✅ Accessible color ratios (WCAG AA)

#### FR-2.3: Responsive Design ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- Mobile-first CSS via Tailwind
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar untuk mobile (future improvement)
- Touch-friendly hit areas

**Acceptance Criteria:**

- ✅ Functional pada desktop (1920x1080+)
- ✅ Functional pada tablet (768x1024)
- ✅ Functional pada mobile (375x667+)
- ✅ No horizontal scroll

---

### 3.3 Enhanced Content Rendering

#### FR-3.1: Markdown Rendering ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- unified pipeline: remark-parse → remark-gfm → remark-rehype → rehype
- GFM support (tables, task lists, strikethrough)
- Prose styling via `@tailwindcss/typography`

**Acceptance Criteria:**

- ✅ Headers (H1-H6) dengan proper hierarchy
- ✅ Lists (ordered, unordered, nested)
- ✅ Tables dengan borders
- ✅ Blockquotes dengan styling
- ✅ Links clickable dan styled

#### FR-3.2: Wikilinks Support ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- Custom remark plugin `remarkWikilinks`
- Transform `[[note]]` → `<a href="/notes/note">note</a>`
- Transform `[[note|alias]]` → `<a href="/notes/note">alias</a>`
- Handle nested paths

**Acceptance Criteria:**

- ✅ Simple wikilinks clickable
- ✅ Aliased wikilinks display alias
- ✅ Links navigate to correct note
- ✅ Broken links tetap rendered (tidak error)

#### FR-3.3: Code Syntax Highlighting ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- rehype-highlight plugin
- highlight.js dengan GitHub Dark theme
- Auto-detect language dari code fence
- 180+ languages support

**Acceptance Criteria:**

- ✅ Code blocks dengan language detection
- ✅ Syntax highlighting applied
- ✅ Dark theme compatible
- ✅ Copy-paste friendly (plain text)

#### FR-3.4: Table of Contents ✅

**Priority:** Medium  
**Status:** ✅ Implemented

**Implementation:**

- rehype-slug untuk heading IDs
- rehype-autolink-headings untuk anchor links
- `extractHeadings()` utility via github-slugger
- Right sidebar dengan sticky positioning
- Nested ToC sesuai heading depth

**Acceptance Criteria:**

- ✅ ToC generated dari H1-H6
- ✅ Clickable links to headings
- ✅ Sticky positioning (scroll-aware)
- ✅ Indentation sesuai heading level
- ✅ Hidden pada artikel tanpa headings

#### FR-3.5: Mermaid Diagrams ✅

**Priority:** Medium  
**Status:** ✅ Implemented

**Implementation:**

- Custom remark plugin `remarkMermaid`
- Mermaid.js v11 via CDN
- Dark theme configuration
- `astro:page-load` event listener untuk re-render

**Acceptance Criteria:**

- ✅ ```mermaid blocks recognized
- ✅ Diagrams rendered correctly
- ✅ Dark theme applied
- ✅ Re-render setelah SPA navigation

#### FR-3.6: Excalidraw Embeds ✅

**Priority:** Low  
**Status:** ✅ Implemented

**Implementation:**

- Custom remark plugin `remarkExcalidraw`
- Encode content ke data attribute
- Client-side iframe rendering via excalidraw.com
- `astro:page-load` event handling

**Acceptance Criteria:**

- ✅ ```excalidraw blocks recognized
- ✅ Iframe embed loaded
- ✅ Interactive viewer functional

---

### 3.4 Search Functionality

#### FR-4.1: Full-Text Search ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- FlexSearch library (client-side)
- Index build dari all notes (title + content)
- Search-as-you-type dengan debounce
- Top 5 results dengan preview
- Dropdown UI dengan absolute positioning

**Acceptance Criteria:**

- ✅ Search box di header
- ✅ Results update saat typing
- ✅ Search title dan content
- ✅ Results clickable (navigate to note)
- ✅ Empty query hides results

---

### 3.5 Git Synchronization

#### FR-5.1: Manual Sync ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- Sync button di sidebar
- POST `/api/sync` endpoint
- simple-git `pull` operation
- Lazy initialization untuk avoid startup errors
- Support private repos via env vars (GIT_USERNAME, GIT_TOKEN)

**Acceptance Criteria:**

- ✅ Sync button functional
- ✅ Button disabled during sync
- ✅ Success feedback (✅ icon, "Synced!" text)
- ✅ Error feedback (❌ icon, "Error" text)
- ✅ Content refreshed setelah sync

#### FR-5.2: Private Repository Support ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- Environment variables: `GIT_USERNAME`, `GIT_TOKEN`
- `getAuthenticatedUrl()` helper function
- Support GitHub dan GitLab tokens

**Acceptance Criteria:**

- ✅ Clone private repos dengan credentials
- ✅ Pull updates dari private repos
- ✅ Credentials tidak exposed di logs

---

### 3.6 Vault Management

#### FR-6.1: File Tree Navigation ✅

**Priority:** High  
**Status:** ✅ Implemented

**Implementation:**

- Recursive directory scanning
- `FileTree.astro` component
- Collapsible folders (default closed)
- Icons: 📁 folders, 📄 files
- Alphabetical sort (folders first)

**Acceptance Criteria:**

- ✅ Tree reflects vault structure
- ✅ Folders collapsible/expandable
- ✅ Click file opens note
- ✅ Hidden files filtered (.git, .obsidian)

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### NFR-1.1: Response Time ✅

- **Page Load:** <2s untuk note standard ✅
- **Search Response:** <500ms ✅
- **SPA Navigation:** <200ms perceived (with loading indicator) ✅
- **Sync Operation:** <10s (typical vault) ✅

#### NFR-1.2: Scalability ✅

- **Vault Size:** Tested dengan 10,000+ notes ✅
- **Concurrent Users:** 1 (single-user v2.0) ✅
- **Build Size:** Client bundle <200KB gzip ✅

#### NFR-1.3: Resource Usage ✅

- **Memory:** <512MB idle ✅
- **CPU:** <10% idle ✅
- **Storage:** Vault size + 100MB overhead ✅

### 4.2 Security Requirements

#### NFR-2.1: Authentication Security ✅

- **Password Hashing:** bcrypt (10 rounds) ✅
- **Session Expiry:** 7 days ✅
- **Secure Cookies:** HttpOnly, Secure flag (production) ✅
- **CSRF Protection:** SameSite cookie attribute ✅

#### NFR-2.2: Data Security ✅

- **No localStorage:** Session hanya di secure cookie ✅
- **HTTPS Recommended:** Production deployment guide ✅
- **Environment Variables:** Sensitive data via .env ✅

### 4.3 Reliability Requirements

#### NFR-3.1: Availability ✅

- **Uptime Target:** 99% (self-hosted) ✅
- **Error Recovery:** Graceful degradation + user feedback ✅
- **Zero Data Loss:** Git sebagai single source of truth ✅

#### NFR-3.2: Error Handling ✅

- **User-Friendly Messages:** Clear error text ✅
- **Logging:** Console logs untuk debugging ✅
- **Fallback:** Local SQLite jika Turso unreachable ✅

### 4.4 Usability Requirements

#### NFR-4.1: User Interface ✅

- **Modern Design:** Tailwind v4 dark theme ✅
- **Intuitive Navigation:** Sidebar + breadcrumbs ✅
- **Loading Indicators:** Overlay + animations ✅
- **Responsive:** Mobile-friendly ✅

#### NFR-4.2: Learning Curve ✅

- **Setup Time:** <15 minutes (experienced user) ✅
- **Zero Learning:** Untuk consumption ✅
- **Documentation:** Comprehensive guides (9 docs) ✅

#### NFR-4.3: Accessibility ✅

- **Semantic HTML:** Proper tags ✅
- **Readable Fonts:** Inter, 16px base ✅
- **High Contrast:** WCAG AA compliant ✅
- **Keyboard Nav:** Tab order logical ✅

### 4.5 Maintainability Requirements

#### NFR-5.1: Code Quality ✅

- **TypeScript:** Type safety ✅
- **Modular Architecture:** Separated components ✅
- **Consistent Style:** Tailwind utilities ✅
- **File Organization:** Clear structure ✅

#### NFR-5.2: Documentation ✅

- **README:** Setup instructions ✅
- **Deployment Guides:** PASSENGER, DOCKER, PM2, TURSO ✅
- **Inline Comments:** For complex logic ✅
- **Vision & SRS:** Updated v2.0 ✅

### 4.6 Portability Requirements

#### NFR-6.1: Platform Independence ✅

- **OS Support:** Linux, macOS, Windows ✅
- **Docker:** Containerized deployment ✅
- **Passenger:** cPanel/shared hosting ✅
- **PM2:** VPS bare metal ✅

#### NFR-6.2: Browser Compatibility ✅

- **Chrome/Edge:** Latest 2 versions ✅
- **Firefox:** Latest 2 versions ✅
- **Safari:** Latest 2 versions ✅
- **Mobile:** iOS Safari, Chrome Android ✅

#### NFR-6.3: Database Portability ✅

- **Local SQLite:** Development ✅
- **Turso Cloud:** Production (edge-compatible) ✅
- **Migration Path:** From better-sqlite3 to Turso ✅

---

## 5. System Features Summary

| Feature             | Priority | Status | Notes                      |
| ------------------- | -------- | ------ | -------------------------- |
| User Authentication | High     | ✅     | Lucia + Drizzle + bcrypt   |
| SPA Experience      | High     | ✅     | Astro View Transitions     |
| Dark Theme UI       | High     | ✅     | Tailwind CSS v4            |
| Markdown Rendering  | High     | ✅     | unified pipeline           |
| Wikilinks           | High     | ✅     | Custom remark plugin       |
| Code Highlighting   | High     | ✅     | rehype-highlight           |
| Table of Contents   | Medium   | ✅     | rehype-slug + auto-links   |
| Search              | High     | ✅     | FlexSearch (client-side)   |
| Git Sync            | High     | ✅     | simple-git + private repos |
| Mermaid Diagrams    | Medium   | ✅     | Mermaid.js v11             |
| Excalidraw          | Low      | ✅     | iframe embeds              |
| File Tree           | High     | ✅     | Recursive scan             |
| Turso Database      | High     | ✅     | Edge-compatible            |
| Passenger Deploy    | High     | ✅     | cPanel ready               |
| Docker Deploy       | High     | ✅     | docker-compose             |
| PM2 Deploy          | Medium   | ✅     | VPS process manager        |

---

## 6. Deployment Requirements

### 6.1 Passenger (cPanel) Deployment ✅

**Requirements:**

- cPanel with Node.js App support
- Node.js 18+
- Git access (SSH or File Manager)

**Files:**

- `app.mjs` - Entry point
- `Passengerfile.json` - Config
- `dist/` - Built application
- `src/` - Source (for SSR)

**Setup Time:** ~10 minutes

### 6.2 Docker Deployment ✅

**Requirements:**

- Docker 20+
- docker-compose 1.29+
- 1GB RAM minimum

**Files:**

- `Dockerfile` - Multi-stage build
- `docker-compose.yml` - Orchestration
- `.dockerignore` - Optimize image size

**Setup Time:** ~5 minutes (after image build)

### 6.3 PM2 Deployment ✅

**Requirements:**

- VPS with Node.js 18+
- PM2 installed globally
- Nginx (optional, for reverse proxy)

**Files:**

- `ecosystem.config.js` - PM2 config
- `dist/server/entry.mjs` - Server entry

**Setup Time:** ~15 minutes (including PM2 setup)

---

## 7. API Endpoints

### 7.1 Authentication APIs

| Endpoint      | Method | Purpose          | Auth Required |
| ------------- | ------ | ---------------- | ------------- |
| `/login`      | GET    | Login page       | No            |
| `/login`      | POST   | Login submission | No            |
| `/api/logout` | POST   | Logout user      | Yes           |

### 7.2 Application APIs

| Endpoint           | Method | Purpose   | Auth Required |
| ------------------ | ------ | --------- | ------------- |
| `/`                | GET    | Dashboard | Yes           |
| `/notes/[...slug]` | GET    | View note | Yes           |
| `/api/sync`        | POST   | Git sync  | Yes           |

---

## 8. Database Schema (Drizzle)

### 8.1 User Table

```typescript
userTable = sqliteTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});
```

### 8.2 Session Table

```typescript
sessionTable = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});
```

---

## 9. Environment Variables

| Variable             | Required | Default         | Description             |
| -------------------- | -------- | --------------- | ----------------------- |
| `TURSO_DATABASE_URL` | No       | `file:local.db` | Database connection     |
| `TURSO_AUTH_TOKEN`   | No       | -               | Turso auth (cloud only) |
| `GIT_REPO_URL`       | Yes      | -               | Vault repository URL    |
| `GIT_USERNAME`       | No       | -               | For private repos       |
| `GIT_TOKEN`          | No       | -               | Personal access token   |
| `NODE_ENV`           | No       | `development`   | Environment mode        |

---

## 10. Testing Checklist

### 10.1 Functional Testing ✅

- [x] Login with valid credentials
- [x] Login with invalid credentials
- [x] Logout functionality
- [x] Session persistence
- [x] File tree navigation
- [x] Note viewing
- [x] Wikilinks navigation
- [x] Search functionality
- [x] Git sync (public repo)
- [x] Git sync (private repo)
- [x] Code highlighting
- [x] Mermaid diagrams
- [x] Table of Contents
- [x] SPA navigation
- [x] Loading indicators

### 10.2 Non-Functional Testing ✅

- [x] Page load performance
- [x] Search response time
- [x] Mobile responsiveness
- [x] Browser compatibility (Chrome, Firefox, Safari)
- [x] Dark theme contrast
- [x] Accessibility (keyboard nav)

### 10.3 Deployment Testing ✅

- [x] Passenger deployment
- [x] Docker deployment
- [x] Local SQLite database
- [x] Turso cloud database
- [x] Build script (`deploy.sh`)

---

## Appendix A: Migration from v1.0

### Breaking Changes

1. **Database:** better-sqlite3 → Turso/LibSQL
2. **ORM:** Direct SQL → Drizzle ORM
3. **Auth Adapter:** BetterSqlite3Adapter → DrizzleSQLiteAdapter
4. **Deployment:** Build-on-server → Pre-built package

### Migration Steps

1. Run `npm uninstall better-sqlite3 @lucia-auth/adapter-sqlite`
2. Run `npm install @libsql/client lucia drizzle-orm @lucia-auth/adapter-drizzle`
3. Update `src/lib/auth.ts` dengan Drizzle adapter
4. Create `src/lib/db/` dengan schema dan client
5. Update `setup.ts` dan `migrate.ts`
6. Run `npx tsx migrate.ts` untuk create tables
7. Run `npx tsx setup.ts` untuk create user

---

## Appendix B: Revision History

| Version | Date     | Changes                                                             | Author             |
| ------- | -------- | ------------------------------------------------------------------- | ------------------ |
| 1.0     | Dec 2024 | Initial release                                                     | Fahri Firdausillah |
| 2.0     | Dec 2024 | SPA, Turso, Tailwind, ToC, Syntax highlighting, Multiple deployment | Fahri Firdausillah |

---

## Appendix C: Future Requirements (v2.1+)

### 🎯 Quick Wins (v2.1) - Implemented December 2024

#### FR-QUICKWIN-1: Dark/Light Theme Toggle ✅
**Priority:** High  
**Status:** ✅ Implemented (Dec 18, 2024)

**Implementation:**
- React component with localStorage persistence
- Blue Topaz color palette (dark & light modes)
- System preference detection on first load
- FOUC (Flash of Unstyled Content) prevention
- Smooth color transitions (200ms)

**Acceptance Criteria:**
- ✅ Toggle button in header next to search
- ✅ Theme persists across sessions
- ✅ All UI elements support both themes
- ✅ Proper contrast ratios (WCAG AA)

**Files Modified:**
- `src/components/ThemeToggle.tsx` (new)
- `src/styles/global.css` (Blue Topaz theme)
- `src/layouts/MainLayout.astro` (FOUC prevention)

---

#### FR-QUICKWIN-2: Copy Code Button ✅
**Priority:** High  
**Status:** ✅ Implemented (Dec 18, 2024)

**Implementation:**
- Rehype plugin to inject copy buttons
- Clipboard API integration
- Success feedback animation (checkmark)
- Dark/light theme styling

**Acceptance Criteria:**
- ✅ Button appears on all code blocks
- ✅ Click copies code to clipboard
- ✅ Visual feedback on successful copy
- ✅ Works in all modern browsers

**Files Modified:**
- `src/lib/rehype-copy-button.ts` (new)
- `src/lib/markdown.ts` (plugin integration)
- `src/styles/global.css` (button styling)
- `src/layouts/DashboardLayout.astro` (click handler)

---

#### FR-QUICKWIN-3: Reading Mode ✅
**Priority:** High  
**Status:** ✅ Implemented (Dec 18, 2024)

**Implementation:**
- React component with sidebar toggle
- localStorage state persistence
- Smooth show/hide animations
- Content area expansion when active

**Acceptance Criteria:**
- ✅ Toggle button in header
- ✅ Sidebar hides/shows smoothly
- ✅ State persists across page loads
- ✅ Content area expands for full-width reading

**Files Modified:**
- `src/components/ReadingModeToggle.tsx` (new)
- `src/layouts/DashboardLayout.astro` (integration)

---

#### FR-QUICKWIN-4: Breadcrumb Navigation ✅
**Priority:** Medium  
**Status:** ✅ Implemented (Dec 18, 2024)

**Implementation:**
- Astro component with slug parsing
- Home icon + clickable path segments
- Chevron separators
- Current page highlighting

**Acceptance Criteria:**
- ✅ Shows full note path in header
- ✅ Each segment is clickable link
- ✅ Home/vault root link included
- ✅ Responsive design for long paths

**Files Modified:**
- `src/components/Breadcrumb.astro` (new)
- `src/layouts/DashboardLayout.astro` (header integration)

---

### 🚨 CRITICAL PRODUCTION ISSUES (Highest Priority)

#### ISSUE-1: Wikilink Resolution - Knowledge Vault ✅
**Priority:** CRITICAL
**Status:** ✅ Fixed (Dec 25, 2024)
**Reported:** Dec 19, 2024

**Problem:**
Link antar halaman di vault "knowledge dinus" tidak berfungsi. Internal wikilinks (`[[note]]`) gagal resolve ke file yang benar.

**Solution Implemented:**
- Enhanced `buildFilePathCache()` dengan 3 strategi resolution
- Case-insensitive matching untuk semua lookups
- Partial path mapping untuk nested structures
- Broken link handling dengan visual class

**Tasks Completed:**
- [x] Debug wikilink resolution untuk nested vaults
- [x] Verify file path cache builds correctly
- [x] Test berbagai wikilink formats (`[[note]]`, `[[folder/note]]`)
- [x] Ensure case-insensitive matching
- [x] Improve broken link handling

**Related Files:**
- `src/lib/vault.ts:115-147` (file path cache dengan 3 strategi)
- `src/lib/markdown.ts:53-143` (wikilink transformation)
- `src/lib/vault.ts:165-167` (cache getter)

---

#### ISSUE-2: Performance & Loading States ✅
**Priority:** CRITICAL
**Status:** ✅ Fixed (Dec 25, 2024)
**Reported:** Dec 19, 2024

**Problem:**
Aplikasi terasa lambat saat akses, tidak ada loading indicators untuk memberikan feedback kepada users.

**Solution Implemented:**
- 3-tier caching system (global layout + markdown + HTTP browser cache)
- Increased markdown cache: 50 → 500 entries, 5min → 30min TTL
- Global cache warming on server startup via Astro integration
- HTTP cache headers untuk stale-while-revalidate

**Tasks Completed:**

**Immediate (Loading States):**
- [x] Add loading spinner pada initial page load
- [x] Add loading state saat navigate antar notes
- [ ] Add skeleton screens untuk content placeholder (optional enhancement)
- [ ] Add loading indicator untuk search (optional enhancement)
- [x] Add progress bar untuk sync operations

**Medium-term (Performance):**
- [x] Analyze performance bottlenecks (profiling)
- [x] Optimize database queries (Astro.locals caching)
- [ ] Consider lazy loading untuk note content (future enhancement)
- [x] Implement content caching strategies (3-tier cache)
- [x] Investigate SSR/SSG opportunities (hybrid output possible)

**Target Metrics Achieved:**
- Initial load: ~1-2s (dengan cache warmed)
- Page navigation: <200ms (dengan cached layout data)
- Markdown cache hit: <10ms

**Related Files:**
- `src/integrations/cache-warming.ts` (server startup cache)
- `src/lib/markdown.ts:26-28` (increased cache size/TTL)
- `src/layouts/DashboardLayout.astro:19-21` (Astro.locals usage)
- `src/pages/notes/[...slug].astro:25` (HTTP cache headers)
- `src/pages/index.astro:21` (HTTP cache headers)

**Remaining Optional Enhancements:**
- Skeleton screens untuk content placeholder
- Loading indicator untuk search

---

### FR-GRAPH: Graph View System

#### FR-GRAPH-1: Graph Data Generation ⏳
**Priority:** High  
**Status:** Planned (v2.1)

**Requirements:**
- System harus build graph structure dari wikilinks
- Node = note, Edge = wikilink connection
- Support bidirectional links
- Calculate node metrics (degree, centrality)
- Update graph data on vault sync

**Acceptance Criteria:**
- AC-GRAPH-1.1: Graph data accurate untuk semua notes
- AC-GRAPH-1.2: Performance <1s untuk 1000 notes
- AC-GRAPH-1.3: Incremental update on sync

#### FR-GRAPH-2: Interactive Visualization ⏳
**Priority:** High  
**Status:** Planned (v2.1-2.2)

**Requirements:**
- Render graph menggunakan D3.js atau Cytoscape
- Interactive: zoom, pan, drag nodes
- Click node navigates to note
- Filter by tags, folders, date
- Multiple layout algorithms

**Acceptance Criteria:**
- AC-GRAPH-2.1: Smooth 60fps rendering
- AC-GRAPH-2.2: WebGL acceleration untuk >1000 nodes
- AC-GRAPH-2.3: Responsive on mobile (touch gestures)

---

### FR-TAG: Tagging System

#### FR-TAG-1: Tag Extraction ⏳
**Priority:** High  
**Status:** Planned (v2.1)

**Requirements:**
- Extract tags dari frontmatter YAML
- Parse inline tags (#tag, #nested/tag)
- Support tag hierarchies
- Index tags untuk quick access

**Acceptance Criteria:**
- AC-TAG-1.1: All tag formats recognized
- AC-TAG-1.2: Tag index built <500ms
- AC-TAG-1.3: Update on vault sync

#### FR-TAG-2: Tag Browser ⏳
**Priority:** Medium  
**Status:** Planned (v2.1)

**Requirements:**
- Tag explorer UI (sidebar panel)
- Filter notes by selected tags
- Tag cloud visualization (weighted)
- Tag autocomplete in search

**Acceptance Criteria:**
- AC-TAG-2.1: Tag list dengan note count
- AC-TAG-2.2: Multi-tag filtering (AND/OR)
- AC-TAG-2.3: Tag cloud responsive

---

### FR-BACKLINK: Backlinks System

#### FR-BACKLINK-1: Backlink Detection ⏳
**Priority:** High  
**Status:** Planned (v2.1)

**Requirements:**
- Build reverse index dari wikilinks
- Detect unlinked mentions (note titles dalam content)
- Extract context around backlinks
- Real-time update capability

**Acceptance Criteria:**
- AC-BACKLINK-1.1: All backlinks detected
- AC-BACKLINK-1.2: Context preview (50 chars before/after)
- AC-BACKLINK-1.3: Index build <1s for 1000 notes

#### FR-BACKLINK-2: Backlink Panel ⏳
**Priority:** Medium  
**Status:** Planned (v2.1)

**Requirements:**
- Display backlinks untuk current note
- Clickable backlinks with preview
- Show unlinked mentions separately
- Count backlinks badge

**Acceptance Criteria:**
- AC-BACKLINK-2.1: Panel di right sidebar
- AC-BACKLINK-2.2: Click navigates to source note
- AC-BACKLINK-2.3: Empty state for notes tanpa backlinks

---

### FR-RECENT: Recent Notes

#### FR-RECENT-1: View History Tracking ✅
**Priority:** Medium
**Status:** ✅ Implemented (Dec 25, 2024)

**Requirements:**
- Track note views (timestamp, note ID)
- Store di localStorage (single user) or DB (multi-user)
- Limit history to 50 items
- Clear history option

**Implementation:**
- localStorage-based tracking with `obsidian-recent-notes` key
- Inline script di note page dengan `define:vars` untuk inject note data
- LRU-style list (max 10 items, most recent first)
- Automatic deduplication (re-opening note moves to top)

**Acceptance Criteria:**
- ✅ View recorded on note load
- ✅ Persists across sessions (localStorage)
- ✅ No performance impact (inline, synchronous)

**Files Modified:**
- `src/pages/notes/[...slug].astro` (inline tracking script)
- `src/lib/recent-notes.ts` (utility functions - future use)

#### FR-RECENT-2: Recent Notes UI ✅
**Priority:** Low
**Status:** ✅ Implemented (Dec 25, 2024)

**Requirements:**
- Display recent 10 notes in sidebar/dashboard
- Sort by last accessed or view count
- Quick access click to navigate

**Implementation:**
- React component `RecentNotes.tsx` dengan collapsible panel
- Sidebar integration di DashboardLayout
- Time-ago formatting (Just now, 5m ago, 2h ago, 3d ago)
- Auto-refresh on localStorage changes
- Badge showing count

**Acceptance Criteria:**
- ✅ List updates immediately (React state + localStorage listener)
- ✅ Show last viewed timestamp (relative time format)
- ✅ Responsive design (collapsible, scrollable)

**Files Modified:**
- `src/components/RecentNotes.tsx` (new)
- `src/layouts/DashboardLayout.astro` (sidebar integration)

---

### FR-SEARCH-ADV: Advanced Search

#### FR-SEARCH-ADV-1: Query Parser ⏳
**Priority:** High  
**Status:** Planned (v2.2)

**Requirements:**
- Parse search syntax: `tag:project path:folder/ "exact phrase"`
- Boolean operators (AND, OR, NOT)
- Regex pattern support
- Field-specific search (title, content, tags, frontmatter)

**Acceptance Criteria:**
- AC-SEARCH-ADV-1.1: All operators work correctly
- AC-SEARCH-ADV-1.2: Syntax errors handled gracefully
- AC-SEARCH-ADV-1.3: Performance <500ms

#### FR-SEARCH-ADV-2: Result Enhancement ⏳
**Priority:** Medium  
**Status:** Planned (v2.2)

**Requirements:**
- Context preview dengan match highlighting
- Search history dengan suggestions
- Result ranking improvement
- Export search results

**Acceptance Criteria:**
- AC-SEARCH-ADV-2.1: Matches highlighted in preview
- AC-SEARCH-ADV-2.2: History stored (10 recent)
- AC-SEARCH-ADV-2.3: Relevant results ranked higher

---

### FR-TEMPLATE: Note Templates

#### FR-TEMPLATE-1: Template Engine ⏳
**Priority:** Medium  
**Status:** Planned (v2.2)

**Requirements:**
- Create notes from templates
- Variable substitution ({{date}}, {{time}}, {{title}})
- Custom variables support
- Template previews

**Acceptance Criteria:**
- AC-TEMPLATE-1.1: Variables replaced correctly
- AC-TEMPLATE-1.2: Error handling for invalid templates
- AC-TEMPLATE-1.3: Fast rendering (<100ms)

#### FR-TEMPLATE-2: Template Manager ⏳
**Priority:** Low  
**Status:** Planned (v2.2)

**Requirements:**
- Template library UI
- CRUD templates (Create, Read, Update, Delete)
- Template categories/tags
- Import/export templates

**Acceptance Criteria:**
- AC-TEMPLATE-2.1: Easy template selection
- AC-TEMPLATE-2.2: Template validation
- AC-TEMPLATE-2.3: Shareable template format

---

### FR-EXPORT: Export Options

#### FR-EXPORT-1: PDF Export ⏳
**Priority:** Medium  
**Status:** Planned (v2.3)

**Requirements:**
- Export single note as PDF
- Preserve markdown formatting, diagrams
- Print-friendly styling
- Custom PDF templates

**Technical:**
- Puppeteer headless browser
- Wait for diagrams to render
- Clean CSS for print

**Acceptance Criteria:**
- AC-EXPORT-1.1: PDF preserves all content
- AC-EXPORT-1.2: Images and diagrams included
- AC-EXPORT-1.3: Table of contents generated

#### FR-EXPORT-2: Static Site Export ⏳
**Priority:** Low  
**Status:** Planned (v2.3)

**Requirements:**
- Export folder/vault as static HTML
- Generate navigation
- Preserve wikilinks as HTML links
- Customizable export templates

**Acceptance Criteria:**
- AC-EXPORT-2.1: All notes exported
- AC-EXPORT-2.2: Links functional
- AC-EXPORT-2.3: Standalone deployment ready

---

### FR-MULTIUSER: Multi-user Support

#### FR-MULTIUSER-1: User Management ⏳
**Priority:** Very High  
**Status:** Planned (v2.3-2.4)

**Requirements:**
- CRUD users (Admin only)
- User profiles (name, email, avatar)
- Password management (change, reset)
- User status (active, suspended)

**Database Changes:**
- Expand user table: add email, role, avatar
- Activity log table
- Permission table

**Acceptance Criteria:**
- AC-MULTIUSER-1.1: Admin dapat manage users
- AC-MULTIUSER-1.2: Users can update own profile
- AC-MULTIUSER-1.3: Secure password reset flow

#### FR-MULTIUSER-2: Role-Based Access ⏳
**Priority:** Very High  
**Status:** Planned (v2.3-2.4)

**Requirements:**
- Roles: Admin, Editor, Reader
- Permissions per role:
  - Admin: Full access
  - Editor: Read + Edit notes
  - Reader: Read-only
- Per-folder/note permissions override
- Permission inheritance

**Acceptance Criteria:**
- AC-MULTIUSER-2.1: Roles enforced at middleware
- AC-MULTIUSER-2.2: Forbidden actions return 403
- AC-MULTIUSER-2.3: UI adapts to user role

---

### FR-API: REST API

#### FR-API-1: Public Endpoints ⏳
**Priority:** High  
**Status:** Planned (v2.4)

**Endpoints:**
```
GET    /api/notes           # List all notes
GET    /api/notes/:slug     # Get note content
GET    /api/search?q=       # Search notes
POST   /api/webhooks/sync   # Trigger sync
GET    /api/tags            # List tags
GET    /api/graph           # Graph data
```

**Acceptance Criteria:**
- AC-API-1.1: All endpoints documented (OpenAPI)
- AC-API-1.2: Versioned API (/api/v1/)
- AC-API-1.3: Error responses standardized

#### FR-API-2: Authentication & Security ⏳
**Priority:** High  
**Status:** Planned (v2.4)

**Requirements:**
- API key authentication
- Key management UI
- Rate limiting (per key)
- CORS configuration
- API usage logging

**Acceptance Criteria:**
- AC-API-2.1: Valid key required for all endpoints
- AC-API-2.2: Rate limit: 100 req/min per key
- AC-API-2.3: Invalid key returns 401

---

### FR-PLUGIN: Plugin System

#### FR-PLUGIN-1: Plugin SDK ⏳
**Priority:** Very High  
**Status:** Planned (v2.5)

**Requirements:**
- Plugin API specification
- Hooks system (lifecycle events)
- Custom remark/rehype plugins
- Custom UI components injection
- Plugin configuration storage

**Acceptance Criteria:**
- AC-PLUGIN-1.1: SDK documentation complete
- AC-PLUGIN-1.2: Example plugins provided
- AC-PLUGIN-1.3: Backward compatibility policy

#### FR-PLUGIN-2: Plugin Manager ⏳
**Priority:** High  
**Status:** Planned (v2.5)

**Requirements:**
- Install/uninstall plugins
- Enable/disable plugins
- Plugin settings UI
- Plugin update checks
- Sandboxed execution (Web Workers)

**Acceptance Criteria:**
- AC-PLUGIN-2.1: Safe plugin isolation
- AC-PLUGIN-2.2: Error in plugin doesn't crash app
- AC-PLUGIN-2.3: Plugin permissions system

---

## Appendix D: Quality Requirements (v2.1+)

### NFR-QUAL-1: Performance Targets

| Metric | Current | v2.1 Target | v3.0 Target |
|--------|---------|-------------|-------------|
| Time to Interactive | 2.5s | 1.5s | 1.0s |
| Search response | 500ms | 200ms | 100ms |
| Graph render (1000 nodes) | N/A | 3s | 1s |
| Memory usage (idle) | 300MB | 200MB | 150MB |
| Bundle size (gzip) | 150KB | 120KB | 100KB |

### NFR-QUAL-2: Scalability Targets

| Metric | v2.0 | v2.4 | v3.0 |
|--------|------|------|------|
| Notes supported | 10K | 50K | 100K |
| Concurrent users | 1 | 10 | 50 |
| API throughput | N/A | 100 req/s | 1000 req/s |
| Database size | 50MB | 500MB | 5GB |

### NFR-QUAL-3: Security Requirements

#### Implemented (v2.0) ✅
- Session-based authentication
- bcrypt password hashing
- Secure cookies (HttpOnly, SameSite)
- HTTPS in production

#### Planned (v2.1+) ⏳
- Rate limiting (login, sync, API)
- CSRF token protection
- Content Security Policy headers
- Input sanitization (DOMPurify)
- SQL injection prevention (via Drizzle)
- XSS prevention
- Security headers (HSTS, X-Frame-Options)
- Dependency vulnerability scanning
- Penetration testing (annually)

### NFR-QUAL-4: Testing Requirements

**Current Status:** No automated tests ❌

**Target (v2.1):**
- Unit tests: 60% coverage (Vitest)
- E2E tests: Critical paths (Playwright)
- Component tests: React components (Testing Library)

**Target (v3.0):**
- Unit tests: 80% coverage
- E2E tests: Full user journeys
- Integration tests: API endpoints
- Performance tests: Load testing (k6)
- Visual regression tests (Percy/Chromatic)

### NFR-QUAL-5: Monitoring & Observability

**Planned (v2.2):**
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)
- Structured logging (Pino/Winston)
- Uptime monitoring (UptimeRobot/StatusCake)

**Planned (v3.0):**
- Distributed tracing (Jaeger/Zipkin)
- Metrics dashboard (Grafana)
- Alerting (PagerDuty/Opsgenie)
- User analytics (privacy-focused)

---

## Appendix E: Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Dec 2024 | Initial SRS document | Fahri Firdausillah |
| 2.0 | Dec 2024 | Updated for v2.0 implementation + Future roadmap | Fahri Firdausillah |
| 2.1 | Dec 19, 2024 | Added Quick Wins v2.1 (theme toggle, copy code, reading mode, breadcrumb) + Critical production issues | Fahri Firdausillah |
| 2.1.1 | Dec 25, 2024 | **CRITICAL ISSUES RESOLVED:** Fixed wikilink resolution (3-strategy cache), Implemented 3-tier caching system (global+markdown+HTTP), Performance optimizations | Fahri Firdausillah |
| 2.1.2 | Dec 25, 2024 | **FR-RECENT IMPLEMENTED:** View history tracking (localStorage), Recent Notes sidebar component dengan collapsible panel, Time-ago formatting | Fahri Firdausillah |

---

*Last updated: December 25, 2024*
*Next review: Q1 2025 (v2.2 features planning)*
