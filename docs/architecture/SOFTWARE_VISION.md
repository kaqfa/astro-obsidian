# Software Vision Document

## Obsidian Web Viewer

**Version:** 2.0  
**Date:** December 2024  
**Author:** Fahri Firdausillah

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini menjelaskan visi pengembangan Obsidian Web Viewer, sebuah aplikasi web modern yang memungkinkan akses vault Obsidian secara online dengan tampilan yang elegan, performa tinggi, dan kemudahan deployment.

### 1.2 Scope

Obsidian Web Viewer adalah solusi self-hosted yang memberikan akses web-based terhadap personal knowledge base yang dikelola dengan Obsidian, dengan fokus pada user experience modern, edge-compatible deployment, dan multiple hosting options.

### 1.3 References

- Obsidian: https://obsidian.md
- Astro Framework: https://astro.build
- Lucia Auth: https://lucia-auth.com
- Turso Database: https://turso.tech
- Tailwind CSS: https://tailwindcss.com

---

## 2. Positioning

### 2.1 Problem Statement

Obsidian adalah aplikasi powerful untuk personal knowledge management, namun memiliki keterbatasan:

- Akses terbatas pada device yang terinstall aplikasi
- Tidak ada solusi gratis untuk web publishing dengan kontrol penuh
- Obsidian Publish berbayar ($8-16/bulan) terlalu mahal untuk personal use
- Solusi static site generator (Quartz, Digital Garden) tidak fleksibel untuk custom logic
- **Deployment complexity** untuk shared hosting yang tidak support native modules

### 2.2 Product Position Statement

| For         | Personal knowledge workers, content creators, researchers                                   |
| ----------- | ------------------------------------------------------------------------------------------- |
| Who         | Membutuhkan akses online terhadap Obsidian vault dengan kontrol penuh                       |
| The         | Obsidian Web Viewer                                                                         |
| Is          | Modern self-hosted web application dengan SPA experience                                    |
| That        | Memberikan akses read-only, search, sync, dan modern UI dengan multiple deployment options  |
| Unlike      | Obsidian Publish atau static site generators                                                |
| Our product | Memberikan kontrol penuh, gratis, deployment-flexible, dan edge-compatible dengan modern UX |

---

## 3. Product Overview

### 3.1 Product Features

#### 3.1.1 Core Features (v2.0 - Current)

1. **Modern Authentication System**
   - Single user login dengan bcrypt password hashing
   - Session management via Lucia Auth
   - Secure cookie handling
   - Drizzle ORM untuk database operations

2. **Modern UI/UX**
   - **Dark theme** dengan Tailwind CSS v4
   - **SPA experience** via Astro View Transitions
   - **Persistent sidebar** navigation
   - **Loading animations** saat page transitions
   - **Responsive design** (desktop & mobile)
   - **Glassmorphism effects** dan modern aesthetics

3. **Enhanced Vault Browser**
   - File tree navigation dengan collapse/expand
   - Hierarchical folder structure
   - Collapsible folders (default collapsed)
   - File metadata display

4. **Advanced Content Rendering**
   - Markdown rendering dengan GFM support
   - **Wikilinks transformation** `[[note]]` dan `[[note|alias]]`
   - **Code syntax highlighting** via rehype-highlight (GitHub Dark theme)
   - **Mermaid diagrams** support
   - **Excalidraw embed** viewer
   - **Table of Contents (ToC)** di right sidebar untuk navigasi artikel panjang
   - **Heading auto-links** via rehype-slug dan rehype-autolink-headings

5. **Fast Search Functionality**
   - Full-text search via FlexSearch
   - Title dan content search
   - Client-side indexing (fast response)
   - Dropdown results dengan preview

6. **Git Synchronization**
   - Manual sync button
   - Support private GitLab/GitHub repositories
   - Git credentials via environment variables
   - Last sync timestamp display
   - Lazy-initialized git client

7. **Edge-Compatible Database**
   - **Turso/LibSQL** untuk production (cloud atau local)
   - **Drizzle ORM** untuk type-safe queries
   - Fallback ke local SQLite untuk development
   - Migration scripts (`migrate.ts`, `setup.ts`)

8. **Multiple Deployment Options**
   - **Passenger** deployment (cPanel/shared hosting)
   - **Docker** deployment (VPS)
   - **PM2** process manager support
   - Pre-built deployment package
   - One-command deployment via docker-compose

#### 3.1.2 Technical Highlights

- **Framework:** Astro 5.x (SSR mode)
- **UI Library:** React 18 (islands architecture)
- **Styling:** Tailwind CSS v4 dengan custom dark theme
- **Database:** Turso/LibSQL + Drizzle ORM
- **Auth:** Lucia v3 dengan Drizzle adapter
- **Search:** FlexSearch (client-side)
- **Markdown:** Unified pipeline (remark + rehype)
- **Git:** simple-git library
- **Diagrams:** Mermaid.js
- **Code Highlighting:** rehype-highlight + highlight.js

---

## 4. Architecture

### 4.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
│  (React Islands + Astro View Transitions + FlexSearch)  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
                       ↓
┌─────────────────────────────────────────────────────────┐
│              Astro SSR Server (@astrojs/node)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth Routes  │  │ API Routes   │  │ Page Routes  │  │
│  │ (Lucia)      │  │ (/api/*)     │  │ (/*.astro)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────┬─────────────┬─────────────────┬────────────┘
             │             │                 │
             ↓             ↓                 ↓
    ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Turso DB  │ │  simple-git  │ │  File System │
    │  (Drizzle)  │ │  (Git Sync)  │ │  (Vault)     │
    └─────────────┘ └──────────────┘ └──────────────┘
```

### 4.2 Deployment Architectures

#### Option 1: Passenger (cPanel)

```
nginx → Passenger → app.mjs → Astro Server
```

#### Option 2: Docker (VPS)

```
nginx → Docker Container (Node.js + Astro Server)
                 ├── Volume: /vault
                 ├── Volume: /data (database)
                 └── Volume: /logs
```

#### Option 3: PM2 (VPS Bare Metal)

```
nginx → PM2 Cluster → Astro Server (multiple instances)
```

---

## 5. Key Innovations

### 5.1 Edge-Compatible Database

- Tidak lagi pakai `better-sqlite3` (native module yang sulit deploy)
- Migrasi ke **Turso/LibSQL** yang edge-compatible
- Bisa deploy ke shared hosting, Vercel, Cloudflare Workers, Railway

### 5.2 Modern SPA Experience

- Astro View Transitions untuk fluid navigation
- No full page reloads
- Persistent sidebar state
- Loading indicators untuk visual feedback
- Mermaid re-rendering otomatis saat navigasi

### 5.3 Pre-Built Deployment

- Build di local, upload hasil build
- Menghindari masalah build di shared hosting
- Deployment script (`deploy.sh`) untuk otomasi
- Separate deployment repo untuk production

### 5.4 Flexible Git Integration

- Support private repositories
- Environment variable untuk credentials
- Lazy initialization untuk avoid startup errors
- Compatible dengan GitLab dan GitHub

---

## 6. Target Deployment Scenarios

### 6.1 Scenario 1: Hobbyist (Budget: $0)

- **Hosting:** Shared hosting dengan cPanel (existing)
- **Database:** Local SQLite file
- **Deployment:** Passenger via cPanel Node.js App
- **Traffic:** Low (<100 views/day)

### 6.2 Scenario 2: Professional (Budget: ~$5/month)

- **Hosting:** VPS (DigitalOcean, Linode, Hetzner)
- **Database:** Turso Cloud (free tier 9GB)
- **Deployment:** Docker dengan Nginx reverse proxy
- **Traffic:** Medium (<1000 views/day)

### 6.3 Scenario 3: Power User (Budget: $5-15/month)

- **Hosting:** Railway / Fly.io / Render
- **Database:** Turso Cloud (paid tier)
- **Deployment:** Auto-deploy from GitHub
- **Traffic:** High (unlimited)
- **Features:** Auto-scaling, built-in monitoring, SSL

---

## 7. Success Metrics

- ✅ **Deployment Time:** <15 minutes from zero to running
- ✅ **Build Time:** <2 seconds for production build
- ✅ **Page Load:** <2 seconds untuk note standard
- ✅ **Search Response:** <500ms
- ✅ **Resource Usage:** <512MB RAM saat idle
- ✅ **Browser Support:** Chrome, Firefox, Safari (latest 2 versions)
- ✅ **Mobile Responsive:** 100% functional pada mobile
- ✅ **Edge Compatibility:** Deploy ke >5 hosting platforms

---

## 8. Product Roadmap

### Current State: v2.0 ✅

**Status:** Production-ready  
**Focus:** Personal knowledge base access  
**Positioning:** "Modern Obsidian Web Viewer"

---

## 9. Future Development

### 🎯 Priority 1: Content Experience Enhancement

#### 9.1 Graph View

**Timeline:** v2.1-2.2  
**Effort:** High  
**Value:** High

**Features:**

- Interactive network visualization (D3.js or Cytoscape)
- Node represents notes, edges represent wikilinks
- Click node to navigate to note
- Filter by tags, folders, date range
- Layout algorithms: force-directed, hierarchical, circular
- Zoom, pan, search in graph
- Highlight note connections (1st, 2nd degree)

**Technical:**

- Build graph data from wikilinks
- Client-side rendering for performance
- WebGL acceleration for large graphs (>1000 nodes)

**Use Cases:**

- Discover hidden connections
- Visual knowledge mapping
- Find orphan notes
- Identify knowledge clusters

---

#### 9.2 Tag System

**Timeline:** v2.1  
**Effort:** Medium  
**Value:** High

**Features:**

- Extract tags from frontmatter (`tags: [tag1, tag2]`)
- Parse inline tags (`#tag`)
- Tag browser/explorer sidebar
- Filter notes by tags (AND/OR logic)
- Tag cloud visualization (weighted by frequency)
- Tag autocomplete saat search
- Tag hierarchy support (`#project/mobile/ios`)

**Technical:**

- Index tags saat vault load
- Update index on sync
- Store tag metadata in search index

**Use Cases:**

- Organize notes by topic
- Quick filtering
- Content discovery

---

#### 9.3 Backlinks Panel

**Timeline:** v2.1  
**Effort:** Medium  
**Value:** High

**Features:**

- Show notes yang link ke current note
- Extract context around link (preview sentence)
- Clickable backlinks
- Count backlinks
- Unlinked mentions (notes yang mention tapi belum di-link)

**Technical:**

- Build reverse index dari wikilinks
- Search note titles dalam content
- Display dengan context highlight

**Use Cases:**

- Find related content
- Understand note importance (hub notes)
- Bidirectional linking

---

#### 9.4 Recent Notes

**Timeline:** v2.1  
**Effort:** Low  
**Value:** Medium

**Features:**

- Recent 10 notes viewed
- Sort by last accessed atau view count
- Quick access dari sidebar/dashboard
- Clear history option

**Technical:**

- Store di localStorage (single user)
- Or database table (multi-user ready)
- Update on note view

**Use Cases:**

- Quick navigation
- Resume reading
- Frequently accessed notes

---

### 🚀 Priority 2: Enhanced Features

#### 9.5 Advanced Search

**Timeline:** v2.2  
**Effort:** Medium  
**Value:** High

**Features:**

- Search in tags, frontmatter fields
- Regex pattern support
- Boolean operators (AND, OR, NOT)
- Search syntax: `tag:project path:folder/ "exact phrase"`
- Search result context preview
- Highlight matches dalam preview
- Search history dengan suggestions

**Technical:**

- Extend FlexSearch indexing
- Query parser untuk advanced syntax
- Ranking algorithm improvement

**Use Cases:**

- Precise content discovery
- Complex queries
- Research tasks

---

#### 9.6 Note Templates

**Timeline:** v2.2  
**Effort:** Medium  
**Value:** Medium

**Features:**

- Create note from template
- Template library/manager
- Variable substitution:
  - `{{date}}` - Current date
  - `{{time}}` - Current time
  - `{{title}}` - Note title
  - Custom vars
- Template categories

**Technical:**

- Store templates as markdown files
- Template engine (mustache/handlebars)
- UI untuk template selection

**Use Cases:**

- Consistent note structure
- Meeting notes, daily notes
- Project templates

---

#### 9.7 Export Options

**Timeline:** v2.3  
**Effort:** High  
**Value:** Medium

**Features:**

- Export single note as PDF/HTML
- Export folder/vault as static site
- Print-friendly view (clean CSS)
- Preserve wikilinks, diagrams
- Custom export templates

**Technical:**

- PDF: Puppeteer headless browser
- HTML: Clean template dengan assets
- Static site: Generate with navigation

**Use Cases:**

- Sharing notes externally
- Offline reading
- Archival

---

#### 9.8 Multi-user Support

**Timeline:** v2.3-2.4  
**Effort:** Very High  
**Value:** High

**Features:**

- User management (create, edit, delete)
- Role-based access:
  - Admin: Full access
  - Editor: Edit notes
  - Reader: Read-only
- Per-folder permissions
- Per-note visibility control
- User activity log
- User profiles

**Technical:**

- User table expansion
- Permission system in database
- Middleware untuk authorization
- Audit logging

**Use Cases:**

- Team knowledge base
- Client documentation access
- Educational content sharing

---

### 🔧 Priority 3: Developer Experience

#### 9.9 REST API

**Timeline:** v2.4  
**Effort:** High  
**Value:** Medium

**Endpoints:**

- `GET /api/notes` - List notes
- `GET /api/notes/:slug` - Get note
- `GET /api/search?q=query` - Search
- `POST /api/webhooks/sync` - Trigger sync
- `GET /api/tags` - List tags
- `GET /api/graph` - Graph data

**Security:**

- API key authentication
- Rate limiting (per key)
- Key management UI

**Use Cases:**

- External integrations
- Custom clients
- Automation workflows

---

#### 9.10 Plugin System

**Timeline:** v2.5  
**Effort:** Very High  
**Value:** High

**Features:**

- Plugin SDK/API
- Custom remark/rehype plugins
- Custom UI components
- Hooks:
  - `beforeRender`, `afterRender`
  - `beforeSync`, `afterSync`
  - `onSearch`
- Plugin manager UI
- Plugin marketplace (future)

**Technical:**

- Plugin isolation/sandboxing
- ESM module loading
- Plugin configuration
- Version compatibility checks

**Use Cases:**

- Custom markdown syntax
- Third-party integrations
- Community extensions

---

## 10. Quality Improvements

### 10.1 Performance Optimizations

| Improvement                      | Priority | Effort | Impact |
| -------------------------------- | -------- | ------ | ------ |
| Lazy loading images              | High     | Low    | Medium |
| Virtual scrolling (file tree)    | Medium   | Medium | High   |
| Code splitting by route          | High     | Medium | High   |
| Service Worker caching           | Medium   | High   | High   |
| Debounced search                 | High     | Low    | Medium |
| Infinite scroll (search results) | Low      | Medium | Medium |

### 10.2 Security Enhancements

| Improvement                    | Priority | Effort | Impact   |
| ------------------------------ | -------- | ------ | -------- |
| Rate limiting (login/sync)     | High     | Medium | High     |
| CSRF protection                | High     | Low    | High     |
| Content Security Policy        | High     | Low    | Medium   |
| Input sanitization (DOMPurify) | High     | Low    | High     |
| SQL injection prevention       | High     | Low    | Critical |
| XSS prevention                 | High     | Low    | Critical |

### 10.3 Developer Experience

| Improvement               | Priority | Effort | Impact |
| ------------------------- | -------- | ------ | ------ |
| React Error Boundaries    | Medium   | Low    | Medium |
| Structured logging (Pino) | Medium   | Medium | High   |
| Error tracking (Sentry)   | Low      | Low    | High   |
| Unit tests (Vitest)       | High     | High   | High   |
| E2E tests (Playwright)    | Medium   | High   | High   |
| CI/CD pipeline            | High     | Medium | High   |
| Code coverage reports     | Low      | Low    | Medium |

### 10.4 UX Polish

| Improvement                  | Priority | Effort | Impact |
| ---------------------------- | -------- | ------ | ------ |
| Skeleton loading states      | High     | Low    | Medium |
| Empty states dengan guidance | High     | Low    | Medium |
| Keyboard shortcuts (Cmd+K)   | High     | Medium | High   |
| Mobile touch gestures        | Medium   | Medium | High   |
| ARIA labels                  | High     | Medium | High   |
| Screen reader support        | Medium   | Medium | Medium |
| Dark/Light mode toggle       | High     | Low    | High   |
| Font size adjustment         | Low      | Low    | Medium |

---

## 11. Major Version Milestones

### v3.0: Social & Collaboration (3-6 bulan)

**Theme:** "From Personal to Shared Knowledge"  
**Target:** Q2-Q3 2025

**Core Features:**

- ✅ Multi-user dengan granular permissions
- ✅ Commenting system pada notes
- ✅ Change tracking & version history
- ⏳ Collaborative editing (via CRDTs/OT)

**Technical Stack:**

- WebSocket (Socket.io) untuk real-time
- Conflict resolution strategy
- User activity feed
- Notification system

**Use Cases:**

- Team documentation dengan discussion
- Peer review process
- Knowledge sharing dalam organization
- Collaborative research

**Success Metrics:**

- Support 50+ concurrent users
- Real-time latency <100ms
- 99.5% uptime

---

### v3.5: Intelligence & Discovery (6-9 bulan)

**Theme:** "Smart Knowledge Management"  
**Target:** Q4 2025

**Core Features:**

- ✅ Graph analysis (centrality, clusters, communities)
- ✅ AI-powered semantic search (embeddings)
- ✅ Auto-tagging & categorization
- ✅ Related notes recommendations
- ✅ Smart backlinks (context-aware)

**Technical Stack:**

- Vector database (Turso AI / Pinecone)
- ML models (OpenAI embeddings atau open-source)
- Graph algorithms (NetworkX / Graphology)
- Recommendation engine

**Use Cases:**

- Research note organization
- Knowledge discovery & serendipity
- Content recommendation
- Automated taxonomy

**Success Metrics:**

- Search relevance >85% accuracy
- Recommendation CTR >20%
- Auto-tag precision >80%

---

### v4.0: Platform & Ecosystem (9-12 bulan)

**Theme:** "Extensible Knowledge Platform"  
**Target:** Q1-Q2 2026

**Core Features:**

- ✅ Plugin marketplace
- ✅ Theme customization system
- ✅ Webhook & integrations (Slack, Discord, Notion, Zapier)
- ✅ Public API dengan SDK (JS, Python, Go)
- ✅ Mobile apps (React Native/Capacitor)

**Technical Stack:**

- Plugin SDK & comprehensive docs
- Sandboxed plugin runtime (Web Workers)
- OAuth 2.0 provider
- Native mobile builds (iOS, Android)
- GraphQL API (future consideration)

**Use Cases:**

- Custom workflows via plugins
- Integration dengan existing tools
- Mobile-first knowledge access
- Third-party app development

**Success Metrics:**

- 100+ plugins available
- 10,000+ API calls/day
- Mobile app 4.5+ star rating
- SDK adoption by 3rd parties

---

## 12. Quick Wins (v2.1)

Low-effort, high-impact improvements:

| Feature                           | Effort | Impact | Timeline |
| --------------------------------- | ------ | ------ | -------- |
| Dark/Light mode toggle            | Low    | High   | 1 week   |
| Font size adjustment              | Low    | Medium | 3 days   |
| Reading mode (hide sidebar)       | Low    | High   | 1 week   |
| Copy code button                  | Low    | High   | 3 days   |
| Note metadata (dates, word count) | Low    | Medium | 1 week   |
| Breadcrumb navigation             | Low    | High   | 1 week   |
| Search history                    | Low    | Medium | 3 days   |
| Favorites/Bookmarks               | Medium | High   | 2 weeks  |
| Print stylesheet                  | Low    | Medium | 2 days   |
| Scroll to top button              | Low    | Low    | 1 day    |

**Total v2.1 Timeline:** 2-3 months

---

## 13. Positioning Strategy Evolution

### Current: v2.x - "Obsidian Web Viewer"

**Positioning:** Modern, self-hosted alternative to Obsidian Publish  
**Audience:** Individual knowledge workers, developers, researchers  
**Pricing:** Free, open-source  
**Value Prop:** Full control, zero subscription cost, modern UI

### Future: v3.x - "Collaborative Knowledge Platform"

**Positioning:** Team knowledge base dengan real-time collaboration  
**Audience:** Small teams (5-50 people), research groups, agencies  
**Pricing:**

- Free tier: 3 users
- Pro: $5/user/month (self-hosted) or $10/user/month (cloud)
  **Value Prop:** Seamless collaboration, version control, team permissions

### Long-term: v4.x - "Knowledge Management Ecosystem"

**Positioning:** Enterprise-ready, extensible platform  
**Audience:** Organizations (50+ employees), SaaS customers, developers  
**Pricing:**

- Community: Free (self-hosted)
- Business: $15/user/month
- Enterprise: Custom pricing
  **Value Prop:** Ecosystem, integrations, API, mobile apps, support

---

## 14. Competitive Landscape

### Direct Competitors

| Product          | Strengths           | Weaknesses            | Our Advantage              |
| ---------------- | ------------------- | --------------------- | -------------------------- |
| Obsidian Publish | Native integration  | $8-16/month           | Free, self-hosted          |
| Notion           | Collaboration       | Not markdown-native   | Markdown-first, Git-backed |
| Confluence       | Enterprise features | Complex, expensive    | Simpler, modern UI         |
| GitBook          | Beautiful docs      | Limited customization | Full control, extensible   |
| Docusaurus       | Free, static        | No dynamic features   | Dynamic, search, auth      |

### Our Unique Position

1. **Markdown + Git Native** - True to Obsidian philosophy
2. **Self-hosted First** - Full data ownership
3. **Modern Tech Stack** - Astro, React, Tailwind
4. **Edge-Compatible** - Deploy anywhere (Turso)
5. **Extensible** - Plugin system (future)

---

## 15. Success Metrics & KPIs

### Technical Metrics

- **Performance:** Page load <2s, Search <500ms
- **Uptime:** 99.9% availability
- **Security:** Zero critical vulnerabilities
- **Build Time:** <30s for CI/CD

### User Metrics (v2.x)

- **Adoption:** 1,000 self-hosted instances
- **GitHub Stars:** 500+
- **Docker Pulls:** 5,000+
- **Documentation Views:** 10,000/month

### User Metrics (v3.x)

- **Active Users:** 10,000
- **Team Accounts:** 100
- **Monthly Active Users:** 5,000
- **Average Session:** 15 minutes

### User Metrics (v4.x)

- **Platform Users:** 100,000
- **API Calls:** 1M/day
- **Plugins Installed:** 50,000
- **Mobile Downloads:** 10,000

---

## 16. Technical Debt & Risks

### Current Technical Debt

1. **No automated testing** - Risk: Regression bugs
2. **No error monitoring** - Risk: Silent failures
3. **Manual deployment** - Risk: Human error
4. **No backup strategy** - Risk: Data loss

### Mitigation Plan

- Q1 2025: Setup Vitest + Playwright
- Q1 2025: Integrate Sentry
- Q2 2025: CI/CD pipeline
- Q2 2025: Automated backups

### Risks & Mitigation

| Risk                      | Probability | Impact   | Mitigation                          |
| ------------------------- | ----------- | -------- | ----------------------------------- |
| Obsidian API changes      | Medium      | High     | Monitor releases, version lock      |
| Turso pricing changes     | Low         | Medium   | Support local SQLite fallback       |
| Competition from Obsidian | High        | High     | Focus on self-hosted, extensibility |
| Scalability limits        | Medium      | High     | Load testing, optimization          |
| Security breach           | Low         | Critical | Regular audits, penetration testing |

---

## 17. Conclusion

Obsidian Web Viewer v2.0 successfully delivers a modern, self-hosted alternative to Obsidian Publish. The roadmap to v4.0 positions the project to evolve from a **personal tool** to a **collaborative platform** to a full **knowledge management ecosystem**.

**Key Strengths:**

- ✅ Modern tech stack (Astro, React, Tailwind, Turso)
- ✅ Multiple deployment options
- ✅ Edge-compatible database
- ✅ Strong foundation for future features

**Next Steps:**

1. **v2.1** (Q1 2025): Quick wins + Content experience (Graph, Tags, Backlinks)
2. **v2.2-2.4** (Q2 2025): Enhanced features (Advanced search, Templates, Multi-user)
3. **v3.0** (Q3 2025): Collaboration features
4. **v4.0** (2026): Platform & ecosystem

The vision is clear: **Make knowledge sharing as effortless as knowledge creation.**

---

_Last updated: December 2024_  
_Version: 2.0_  
_Next review: Q1 2025_

## Appendix: Tech Stack Summary

| Category         | Technology                      | Purpose                      |
| ---------------- | ------------------------------- | ---------------------------- |
| Framework        | Astro 5.x                       | SSR + Islands Architecture   |
| UI Library       | React 18                        | Interactive components       |
| Styling          | Tailwind CSS v4                 | Modern dark theme            |
| Database         | Turso/LibSQL                    | Edge-compatible SQLite       |
| ORM              | Drizzle                         | Type-safe queries            |
| Auth             | Lucia v3                        | Session management           |
| Search           | FlexSearch                      | Client-side full-text search |
| Markdown         | unified + remark + rehype       | Content processing           |
| Syntax Highlight | rehype-highlight + highlight.js | Code blocks                  |
| Diagrams         | Mermaid.js                      | Diagram rendering            |
| Git              | simple-git                      | Repository sync              |
| Deployment       | Passenger / Docker / PM2        | Multiple options             |
