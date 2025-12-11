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

## 8. Future Considerations

### 8.1 Phase 3 (Potential Features)

- Multi-user support dengan role-based access
- Auto-sync via webhooks
- Collaborative annotations
- Export to PDF/EPUB
- Full-text search dengan highlight
- Graph view (network visualization)
- Mobile app (PWA)
- Content analytics

### 8.2 Technical Debt

- Add comprehensive unit tests
- Set up CI/CD pipeline
- Performance monitoring (Sentry, LogRocket)
- Automated backups
- Health check endpoints

---

## 9. Conclusion

Obsidian Web Viewer v2.0 berhasil mencapai tujuan utama:

1. ✅ Modern, elegant UI dengan dark theme
2. ✅ SPA-like experience tanpa kompleksitas framework besar
3. ✅ Edge-compatible deployment (Turso)
4. ✅ Multiple deployment options (Passenger, Docker, PM2)
5. ✅ Code syntax highlighting dan ToC untuk developer experience
6. ✅ Simple setup process (<10 menit untuk expert user)

Aplikasi ini sekarang production-ready dan deployment-flexible, cocok untuk personal use hingga small team knowledge base.

---

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
