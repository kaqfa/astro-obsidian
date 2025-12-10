# Software Requirements Specification
## Obsidian Web Viewer

**Version:** 1.0  
**Date:** December 2024  
**Author:** Fahri Firdausillah

---

## 1. Introduction

### 1.1 Purpose
Dokumen ini mendefinisikan functional dan non-functional requirements untuk Obsidian Web Viewer. Dokumen ini ditujukan untuk developer, tester, dan stakeholder yang terlibat dalam pengembangan sistem.

### 1.2 Scope
Obsidian Web Viewer adalah aplikasi web self-hosted yang memberikan akses read-only terhadap vault Obsidian dengan fitur authentication, search, dan Git synchronization.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| API | Application Programming Interface |
| SSR | Server-Side Rendering |
| UI | User Interface |
| UX | User Experience |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| GFM | GitHub Flavored Markdown |

### 1.4 References
- Software Vision Document v1.0
- Astro Documentation: https://docs.astro.build
- Lucia Auth Documentation: https://lucia-auth.com

### 1.5 Overview
Dokumen ini dibagi menjadi:
- Section 2: Overall Description
- Section 3: Functional Requirements
- Section 4: Non-Functional Requirements
- Section 5: System Features

---

## 2. Overall Description

### 2.1 Product Perspective
Obsidian Web Viewer adalah standalone system yang berinteraksi dengan:
- Git repository (source of truth untuk vault)
- Web browser (client interface)
- File system (local cache untuk vault)
- SQLite database (authentication data)

### 2.2 Product Functions
Major functions yang disediakan:
1. User authentication dan session management
2. Vault browsing dengan file tree navigation
3. Markdown content rendering dengan Obsidian features
4. Full-text search
5. Git repository synchronization

### 2.3 User Classes and Characteristics

#### 2.3.1 Administrator/Owner
- **Characteristics:** Technical user dengan akses server
- **Skills:** Familiar dengan Git, command line, web deployment
- **Responsibilities:** Setup, configuration, maintenance
- **Frequency:** Daily untuk consumption, weekly untuk maintenance

#### 2.3.2 End User (Future)
- **Characteristics:** Non-technical user
- **Skills:** Basic web browsing
- **Responsibilities:** Content consumption
- **Frequency:** Varies based on need

### 2.4 Operating Environment
- **Server:** Node.js runtime (v18+)
- **Database:** SQLite 3
- **Client:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Network:** HTTP/HTTPS protocol
- **Storage:** Local file system untuk vault cache

### 2.5 Design and Implementation Constraints
- Must use Astro SSR framework
- Authentication via Lucia (no external auth provider)
- Read-only access (no content editing)
- Git repository sebagai single source of truth
- Single user untuk v1.0

### 2.6 Assumptions and Dependencies
- User memiliki Git repository untuk vault
- Repository accessible via HTTPS/SSH
- Vault menggunakan .md files dengan Obsidian format
- Server memiliki Git client installed
- Network connectivity tersedia untuk Git operations

---

## 3. Functional Requirements

### 3.1 Authentication System

#### FR-1.1: User Login
**Priority:** High  
**Description:** System harus menyediakan login form untuk user authentication

**Input:**
- Username (string, required)
- Password (string, required)

**Processing:**
1. Validasi input tidak kosong
2. Query user dari database
3. Verifikasi password
4. Create session jika valid
5. Set session cookie

**Output:**
- Success: Redirect ke dashboard
- Failure: Error message "Username atau password salah"

**Acceptance Criteria:**
- AC-1.1.1: User dapat login dengan credentials yang valid
- AC-1.1.2: User tidak dapat login dengan credentials invalid
- AC-1.1.3: Session cookie dibuat setelah login sukses
- AC-1.1.4: Error message informatif untuk login gagal

#### FR-1.2: Session Management
**Priority:** High  
**Description:** System harus maintain user session dan validate setiap request

**Processing:**
1. Check session cookie pada setiap request
2. Validate session dengan database
3. Refresh session jika mendekati expiry
4. Clear invalid session

**Acceptance Criteria:**
- AC-1.2.1: Valid session dapat akses protected routes
- AC-1.2.2: Invalid/expired session redirect ke login
- AC-1.2.3: Session auto-refresh sebelum expiry

#### FR-1.3: User Logout
**Priority:** Medium  
**Description:** User dapat logout dan invalidate session

**Processing:**
1. Invalidate session di database
2. Clear session cookie
3. Redirect ke login page

**Acceptance Criteria:**
- AC-1.3.1: Session dihapus dari database
- AC-1.3.2: Cookie dihapus dari browser
- AC-1.3.3: User redirect ke login page

### 3.2 Vault Management

#### FR-2.1: File Tree Display
**Priority:** High  
**Description:** System harus menampilkan struktur folder vault dalam tree view

**Input:** Vault directory path

**Processing:**
1. Scan vault directory recursively
2. Build hierarchical structure
3. Filter hidden files/folders
4. Sort alphabetically (folders first)

**Output:** Nested tree structure dengan folders dan files

**Acceptance Criteria:**
- AC-2.1.1: Semua folders ditampilkan dengan icon 📁
- AC-2.1.2: Semua .md files ditampilkan dengan icon 📄
- AC-2.1.3: Hidden files/folders tidak ditampilkan
- AC-2.1.4: Tree dapat di-expand/collapse
- AC-2.1.5: Sort order: folders first, kemudian alphabetical

#### FR-2.2: Note Reading
**Priority:** High  
**Description:** User dapat membuka dan membaca note individual

**Input:** Note slug/path

**Processing:**
1. Resolve path ke file
2. Read file content
3. Parse frontmatter
4. Render markdown ke HTML
5. Transform wikilinks
6. Render mermaid diagrams
7. Handle excalidraw embeds

**Output:** Rendered HTML content

**Acceptance Criteria:**
- AC-2.2.1: Markdown di-render dengan benar
- AC-2.2.2: Wikilinks [[note]] menjadi clickable links
- AC-2.2.3: Mermaid code blocks di-render sebagai diagram
- AC-2.2.4: Frontmatter diparsing tetapi tidak ditampilkan di content
- AC-2.2.5: File not found menampilkan 404 page

#### FR-2.3: Navigation
**Priority:** Medium  
**Description:** User dapat navigate antar notes

**Acceptance Criteria:**
- AC-2.3.1: Klik file di tree membuka note
- AC-2.3.2: Klik wikilink membuka target note
- AC-2.3.3: Back button kembali ke previous view
- AC-2.3.4: URL update sesuai note path

### 3.3 Search Functionality

#### FR-3.1: Search Interface
**Priority:** High  
**Description:** System menyediakan search bar untuk mencari notes

**Input:** Search query (string)

**Processing:**
1. Build search index dari semua notes
2. Search berdasarkan title dan content
3. Rank results by relevance
4. Limit hasil maksimal 5 per query

**Output:** List of matching notes dengan preview

**Acceptance Criteria:**
- AC-3.1.1: Search box tersedia di sidebar
- AC-3.1.2: Results muncul saat user mengetik
- AC-3.1.3: Results menampilkan title dan content preview
- AC-3.1.4: Klik result membuka note
- AC-3.1.5: Empty query tidak menampilkan results

#### FR-3.2: Search Performance
**Priority:** Medium  
**Description:** Search harus fast dan responsive

**Acceptance Criteria:**
- AC-3.2.1: Search response < 500ms
- AC-3.2.2: Index dibangun saat page load
- AC-3.2.3: Client-side search (tidak hit server)

### 3.4 Git Synchronization

#### FR-4.1: Manual Sync
**Priority:** High  
**Description:** User dapat trigger manual sync dari Git repository

**Processing:**
1. Execute git pull command
2. Update local vault cache
3. Refresh content index
4. Update last sync timestamp

**Output:**
- Success: Sync timestamp updated, content refreshed
- Failure: Error message dengan detail

**Acceptance Criteria:**
- AC-4.1.1: Sync button tersedia di sidebar
- AC-4.1.2: Button disabled saat sync in progress
- AC-4.1.3: Success state ditampilkan setelah sync
- AC-4.1.4: Error message jelas jika sync gagal
- AC-4.1.5: Content di-refresh setelah successful sync

#### FR-4.2: Sync Status
**Priority:** Medium  
**Description:** System menampilkan last sync information

**Acceptance Criteria:**
- AC-4.2.1: Last sync timestamp ditampilkan
- AC-4.2.2: "Not synced yet" jika belum pernah sync
- AC-4.2.3: Timestamp update setelah sync

### 3.5 Content Rendering

#### FR-5.1: Markdown Rendering
**Priority:** High  
**Description:** System harus render markdown dengan GitHub Flavored Markdown support

**Acceptance Criteria:**
- AC-5.1.1: Headers (H1-H6) rendered correctly
- AC-5.1.2: Lists (ordered/unordered) rendered
- AC-5.1.3: Code blocks dengan syntax highlighting
- AC-5.1.4: Blockquotes rendered
- AC-5.1.5: Tables rendered
- AC-5.1.6: Links clickable
- AC-5.1.7: Images displayed (if present)

#### FR-5.2: Wikilinks Support
**Priority:** High  
**Description:** Transform Obsidian wikilinks ke HTML links

**Input:** `[[note name]]` atau `[[note name|alias]]`

**Output:** `<a href="/notes/note-name">alias atau note name</a>`

**Acceptance Criteria:**
- AC-5.2.1: Simple wikilinks [[note]] transformed
- AC-5.2.2: Aliased wikilinks [[note|alias]] transformed
- AC-5.2.3: Links point to correct route
- AC-5.2.4: Broken links tetap rendered (tidak error)

#### FR-5.3: Mermaid Diagrams
**Priority:** Medium  
**Description:** Render mermaid code blocks sebagai diagrams

**Acceptance Criteria:**
- AC-5.3.1: ```mermaid blocks recognized
- AC-5.3.2: Diagram rendered via mermaid.js
- AC-5.3.3: Dark theme compatible
- AC-5.3.4: Syntax error di-handle gracefully

#### FR-5.4: Excalidraw Support
**Priority:** Low  
**Description:** Display excalidraw drawings via embed

**Acceptance Criteria:**
- AC-5.4.1: ```excalidraw blocks recognized
- AC-5.4.2: Embed viewer displayed
- AC-5.4.3: Fallback jika data invalid

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### NFR-1.1: Response Time
- Page load: < 2 seconds untuk note standard
- Search response: < 500ms
- Sync operation: < 10 seconds (tergantung repo size)
- API endpoints: < 1 second response time

#### NFR-1.2: Scalability
- Support vault hingga 10,000 notes
- Concurrent users: 1 (single user v1.0)
- Future: Support hingga 50 concurrent users

#### NFR-1.3: Resource Usage
- Memory footprint: < 512MB saat idle
- CPU usage: < 10% saat idle
- Storage: Vault size + 50MB overhead

### 4.2 Security Requirements

#### NFR-2.1: Authentication Security
- Session cookie dengan secure flag (production)
- Session expiry: 7 days
- Password requirement: minimal 8 characters (recommendation)
- Protection against brute force: Rate limiting (future)

#### NFR-2.2: Data Security
- No sensitive data di localStorage
- Session data encrypted dalam cookie
- HTTPS enforced di production (recommendation)
- CSRF protection (future)

#### NFR-2.3: Authorization
- Protected routes hanya accessible setelah login
- API endpoints validate session
- Unauthorized access redirect ke login

### 4.3 Reliability Requirements

#### NFR-3.1: Availability
- Target uptime: 99% (self-hosted)
- Graceful degradation jika Git unreachable
- Error recovery tanpa data loss

#### NFR-3.2: Error Handling
- User-friendly error messages
- Logging untuk debugging
- Automatic retry untuk transient failures

### 4.4 Usability Requirements

#### NFR-4.1: User Interface
- Responsive design (desktop & mobile)
- Dark theme by default
- Intuitive navigation
- Minimal clicks untuk common tasks

#### NFR-4.2: Learning Curve
- Setup guide < 5 steps
- Zero learning curve untuk consumption
- Tooltips untuk non-obvious features

#### NFR-4.3: Accessibility
- Keyboard navigation support
- Readable font sizes
- High contrast ratio
- Semantic HTML

### 4.5 Maintainability Requirements

#### NFR-5.1: Code Quality
- TypeScript untuk type safety
- Consistent code style
- Modular architecture
- < 200 lines per file (recommendation)

#### NFR-5.2: Documentation
- Inline comments untuk complex logic
- README dengan setup instructions
- API documentation
- Architecture diagram

#### NFR-5.3: Testability
- Unit tests untuk core functions (future)
- Integration tests untuk critical paths (future)
- Test coverage > 70% (future goal)

### 4.6 Portability Requirements

#### NFR-6.1: Platform Independence
- Run pada Linux, macOS, Windows
- Docker support (future)
- Standard Node.js runtime

#### NFR-6.2: Browser Compatibility
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## 5. System Features

### 5.1 Feature: User Authentication

**Description:** Secure login system untuk protect vault access

**Functional Requirements:**
- FR-1.1: User Login
- FR-1.2: Session Management
- FR-1.3: User Logout

**Priority:** High

**Risk:** Medium (security implications)

### 5.2 Feature: Vault Browser

**Description:** Navigate dan view vault content

**Functional Requirements:**
- FR-2.1: File Tree Display
- FR-2.2: Note Reading
- FR-2.3: Navigation

**Priority:** High

**Risk:** Low

### 5.3 Feature: Search

**Description:** Find notes quickly via search

**Functional Requirements:**
- FR-3.1: Search Interface
- FR-3.2: Search Performance

**Priority:** Medium

**Risk:** Low

### 5.4 Feature: Git Sync

**Description:** Synchronize vault dari remote repository

**Functional Requirements:**
- FR-4.1: Manual Sync
- FR-4.2: Sync Status

**Priority:** High

**Risk:** Medium (network dependency)

### 5.5 Feature: Content Rendering

**Description:** Render markdown dengan Obsidian features

**Functional Requirements:**
- FR-5.1: Markdown Rendering
- FR-5.2: Wikilinks Support
- FR-5.3: Mermaid Diagrams
- FR-5.4: Excalidraw Support

**Priority:** High

**Risk:** Low

---

## 6. External Interface Requirements

### 6.1 User Interfaces

#### UI-1: Login Page
- Layout: Centered form
- Fields: Username, Password
- Actions: Login button
- Feedback: Error messages inline

#### UI-2: Dashboard
- Layout: Sidebar + Main content
- Sidebar: File tree, Search, Sync button, Logout
- Main: Welcome message atau note content
- Responsive: Collapsible sidebar pada mobile

#### UI-3: Note View
- Layout: Full-width content area
- Header: Back button, title, metadata
- Content: Rendered markdown
- Footer: None

### 6.2 Hardware Interfaces
Not applicable (web-based application)

### 6.3 Software Interfaces

#### SI-1: Git Repository
- **Interface Type:** Command-line via simple-git
- **Purpose:** Source vault content
- **Protocol:** HTTPS/SSH
- **Operations:** clone, pull, fetch, log

#### SI-2: File System
- **Interface Type:** Node.js fs module
- **Purpose:** Read vault files
- **Operations:** readdir, readFile, stat

#### SI-3: SQLite Database
- **Interface Type:** better-sqlite3 library
- **Purpose:** Store authentication data
- **Schema:** user table, session table

### 6.4 Communications Interfaces

#### CI-1: HTTP/HTTPS
- **Protocol:** HTTP 1.1 / HTTP 2
- **Port:** Configurable (default 4321 dev, 3000 prod)
- **Security:** HTTPS recommended for production

#### CI-2: WebSocket
Not used in v1.0 (future consideration untuk real-time sync)

---

## 7. Other Requirements

### 7.1 Database Requirements
- SQLite 3 untuk authentication
- Tables: user, session
- Automatic schema initialization
- Backup strategy (manual file copy)

### 7.2 Internationalization
- Default: English UI labels
- Date/time: Locale-aware (id-ID default)
- Future: i18n support untuk UI

### 7.3 Legal Requirements
- Privacy: Personal vault data tidak disimpan di cloud
- License: MIT atau similar open-source license
- Compliance: Self-hosted = minimal compliance requirements

---

## Appendix A: Use Cases

### UC-1: Login to Vault
**Actor:** User  
**Precondition:** User account exists  
**Main Flow:**
1. User navigate ke login page
2. User enter username dan password
3. System validate credentials
4. System create session
5. User redirected to dashboard

**Alternate Flow:**
- 3a. Invalid credentials: Show error, return to step 2

**Postcondition:** User logged in dengan valid session

### UC-2: Browse Vault
**Actor:** Authenticated User  
**Precondition:** User logged in  
**Main Flow:**
1. User view file tree di sidebar
2. User expand/collapse folders
3. User click note name
4. System load dan render note
5. User read content

**Postcondition:** Note displayed di main area

### UC-3: Search Notes
**Actor:** Authenticated User  
**Precondition:** User logged in, vault has notes  
**Main Flow:**
1. User type query di search box
2. System search index
3. System display results
4. User click result
5. System open selected note

**Postcondition:** Selected note displayed

### UC-4: Sync Vault
**Actor:** Authenticated User  
**Precondition:** User logged in, Git repo accessible  
**Main Flow:**
1. User click Sync button
2. System disable button
3. System execute git pull
4. System refresh local vault
5. System update last sync time
6. System show success message

**Alternate Flow:**
- 3a. Git pull fails: Show error message, re-enable button

**Postcondition:** Vault synced dengan remote repository

---

## Appendix B: Data Dictionary

### User Table
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique user identifier |
| username | TEXT | NOT NULL, UNIQUE | Username for login |
| password_hash | TEXT | NOT NULL | Hashed password |

### Session Table
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Session identifier |
| expires_at | INTEGER | NOT NULL | Unix timestamp expiry |
| user_id | TEXT | FOREIGN KEY | Reference to user.id |

### Note Object
| Field | Type | Description |
|-------|------|-------------|
| slug | string | URL-safe path identifier |
| title | string | Note title from frontmatter atau filename |
| path | string | Relative path dari vault root |
| content | string | Raw markdown content |
| frontmatter | object | Parsed YAML frontmatter |
| lastModified | Date | File modification timestamp |

### FileTreeItem Object
| Field | Type | Description |
|-------|------|-------------|
| name | string | File/folder name |
| path | string | Relative path dari vault root |
| type | 'file' \| 'folder' | Item type |
| children | FileTreeItem[] | Child items (folders only) |

---

## Appendix C: Traceability Matrix

| Requirement | Vision Reference | Test Case | Priority |
|-------------|------------------|-----------|----------|
| FR-1.1 | 4.2.1 | TC-AUTH-01 | High |
| FR-2.1 | 4.2.2 | TC-VAULT-01 | High |
| FR-2.2 | 4.2.3 | TC-VAULT-02 | High |
| FR-3.1 | 4.2.4 | TC-SEARCH-01 | Medium |
| FR-4.1 | 4.2.5 | TC-SYNC-01 | High |

---

## Appendix D: Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Dec 2024 | Initial SRS document | Fahri Firdausillah |
