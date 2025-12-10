# Software Vision Document
## Obsidian Web Viewer

**Version:** 1.0  
**Date:** December 2024  
**Author:** Fahri Firdausillah

---

## 1. Introduction

### 1.1 Purpose
Dokumen ini menjelaskan visi pengembangan Obsidian Web Viewer, sebuah aplikasi web yang memungkinkan akses vault Obsidian secara online dengan mode read-only dan sinkronisasi otomatis dari Git repository.

### 1.2 Scope
Obsidian Web Viewer adalah solusi self-hosted yang memberikan akses web-based terhadap personal knowledge base yang dikelola dengan Obsidian, dengan fokus pada konsumsi konten dan sinkronisasi yang mudah.

### 1.3 References
- Obsidian: https://obsidian.md
- Astro Framework: https://astro.build
- Lucia Auth: https://lucia-auth.com

---

## 2. Positioning

### 2.1 Problem Statement
Obsidian adalah aplikasi powerful untuk personal knowledge management, namun memiliki keterbatasan:
- Akses terbatas pada device yang terinstall aplikasi
- Tidak ada solusi gratis untuk web publishing dengan kontrol penuh
- Obsidian Publish berbayar ($8-16/bulan) terlalu mahal untuk personal use
- Solusi static site generator (Quartz, Digital Garden) tidak fleksibel untuk custom logic

### 2.2 Product Position Statement

| For | Personal knowledge workers, content creators, researchers |
|-----|----------------------------------------------------------|
| Who | Membutuhkan akses online terhadap Obsidian vault dengan kontrol penuh |
| The | Obsidian Web Viewer |
| Is | Self-hosted web application dengan SSR |
| That | Memberikan akses read-only, search, dan sync dari Git repository |
| Unlike | Obsidian Publish atau static site generators |
| Our product | Memberikan kontrol penuh, gratis, dan dapat dikustomisasi sesuai kebutuhan |

---

## 3. Stakeholder and User Descriptions

### 3.1 Stakeholder Summary

| Name | Description | Responsibilities |
|------|-------------|------------------|
| Developer/Owner | Pengembang dan pengguna utama | Setup, maintenance, customization |
| End User | User yang mengakses vault | Membaca dan mencari konten |

### 3.2 User Summary

| Name | Description | Stakeholder |
|------|-------------|-------------|
| Solo Knowledge Worker | Individual yang mengelola personal knowledge base | Developer/Owner |
| Content Consumer | User yang hanya membaca konten (future: multi-user) | End User |

### 3.3 User Environment
- **Primary Access:** Web browser (desktop & mobile)
- **Network:** Internet connection untuk akses remote
- **Technical Skill:** Minimal untuk end user, intermediate untuk setup

---

## 4. Product Overview

### 4.1 Product Perspective
Obsidian Web Viewer bukan pengganti Obsidian desktop, melainkan komplemen yang memberikan akses web-based untuk konsumsi konten. Aplikasi ini berada di ekosistem personal knowledge management sebagai layer akses tambahan.

### 4.2 Product Features

#### 4.2.1 Core Features (v1.0)
1. **Authentication System**
   - Single user login
   - Session management
   - Secure cookie handling

2. **Vault Browser**
   - File tree navigation
   - Hierarchical folder structure
   - File metadata display

3. **Content Rendering**
   - Markdown rendering dengan GFM support
   - Wikilinks transformation
   - Syntax highlighting
   - Mermaid diagrams
   - Excalidraw embed viewer

4. **Search Functionality**
   - Full-text search
   - Title search
   - Fast client-side indexing

5. **Git Synchronization**
   - Manual sync via button
   - Pull from remote repository
   - Sync status indicator

#### 4.2.2 Future Features (Roadmap)
1. **Enhanced Security**
   - Password hashing (bcrypt)
   - Rate limiting
   - CSRF protection

2. **Advanced Features**
   - Auto-sync dengan interval
   - Backlinks viewer
   - Tag filtering
   - Graph view (optional)
   - Recent notes widget

3. **Multi-user Support**
   - Role-based access control
   - Shared annotations
   - Activity logs

4. **Performance Optimization**
   - Lazy loading
   - Image optimization
   - Cache strategy

### 4.3 Assumptions and Dependencies

#### Assumptions
- User memiliki Git repository untuk vault Obsidian
- Vault menggunakan struktur standard Obsidian (.md files)
- Deployment pada environment dengan Node.js support
- Single user untuk initial version

#### Dependencies
- Astro SSR framework
- Lucia authentication library
- simple-git untuk Git operations
- FlexSearch untuk search functionality
- Mermaid.js untuk diagram rendering

---

## 5. Product Features Detail

### 5.1 Authentication & Security
**Priority:** High  
**Description:** Sistem login untuk melindungi akses ke vault pribadi

**Benefits:**
- Proteksi konten pribadi
- Session management yang aman
- Kontrol akses granular (future)

### 5.2 Content Rendering
**Priority:** High  
**Description:** Render markdown dengan support untuk Obsidian-specific features

**Benefits:**
- Compatibility dengan vault Obsidian existing
- Rich content display (diagrams, embeds)
- User experience mendekati Obsidian desktop

### 5.3 Search
**Priority:** Medium  
**Description:** Fast search untuk menemukan konten dengan cepat

**Benefits:**
- Produktivitas meningkat
- Navigation yang lebih baik untuk vault besar
- Client-side search = fast response

### 5.4 Git Sync
**Priority:** High  
**Description:** Sinkronisasi vault dari Git repository

**Benefits:**
- Single source of truth (Git repository)
- Version control built-in
- Easy deployment dan backup

---

## 6. Constraints

### 6.1 Technical Constraints
- Read-only access (tidak ada editing via web)
- Butuh Node.js runtime untuk deployment
- Git repository sebagai storage backend
- Performance bergantung pada vault size

### 6.2 Resource Constraints
- Development oleh single developer
- Self-hosted = infrastructure cost minimal
- Maintenance time terbatas

### 6.3 Regulatory Constraints
- Data privacy (personal vault)
- GDPR compliance untuk future multi-user

---

## 7. Quality Attributes

### 7.1 Performance
- Page load < 2s untuk note berukuran standard
- Search response < 500ms
- Sync operation < 10s (tergantung repo size)

### 7.2 Reliability
- Uptime 99% (self-hosted)
- Graceful error handling
- Automatic session recovery

### 7.3 Usability
- Intuitive navigation
- Minimal learning curve
- Mobile-responsive design

### 7.4 Security
- Secure authentication
- Session expiration
- Protected API endpoints

### 7.5 Maintainability
- Clean code structure
- Modular architecture
- Comprehensive documentation

---

## 8. Documentation Requirements

### 8.1 User Documentation
- Setup guide
- Usage tutorial
- Troubleshooting FAQ

### 8.2 System Documentation
- Architecture overview
- API documentation
- Deployment guide

---

## 9. Success Metrics

### 9.1 Initial Release (v1.0)
- ✅ Successful authentication
- ✅ Complete vault rendering
- ✅ Working search functionality
- ✅ Successful Git sync

### 9.2 Future Versions
- User satisfaction score
- Performance benchmarks
- Feature adoption rate
- Community contributions (if open-sourced)

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Vault | Koleksi catatan dan file dalam Obsidian |
| Wikilinks | Internal link format Obsidian ([[note]]) |
| SSR | Server-Side Rendering |
| GFM | GitHub Flavored Markdown |
| Personal Access Token | Token untuk akses Git repository private |

---

## Appendix B: Revision History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 1.0 | Dec 2024 | Initial vision document | Fahri Firdausillah |
