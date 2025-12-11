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
