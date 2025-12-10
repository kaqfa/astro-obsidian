# Obsidian Web

Web-based Obsidian vault viewer dengan Astro SSR. Read-only access dengan sync dari Git repository.

## Features

✅ Authentication (single user)
✅ File tree navigation
✅ Markdown rendering dengan wikilinks support
✅ Mermaid diagrams
✅ Excalidraw embed viewer
✅ Fast search dengan FlexSearch
✅ Git sync via button
✅ Dark theme

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup User

Buat user pertama untuk login:

```bash
npx tsx setup.ts
```

Masukkan username dan password.

### 3. Clone Vault

Ada 2 cara:

**Cara A: Manual Clone**

```bash
git clone <url-repo-obsidian> vault
```

**Cara B: Via Environment Variable**

```bash
cp .env.example .env
# Edit .env, isi GIT_REPO_URL
```

### 3b. Setup Private Repo (GitLab/GitHub)

Jika menggunakan private repository, Anda memerlukan Personal Access Token (PAT).

**Langkah-langkah untuk GitLab:**

1. Login ke GitLab > Edit Profile > Access Tokens
2. Buat token baru dengan scope `read_repository`
3. Copy config example: `cp .env.example .env`
4. Isi variable berikut di `.env`:

```ini
GIT_REPO_URL=https://gitlab.com/username/vault.git  # URL repo tanpa .git di akhir juga bisa
GIT_USERNAME=username_gitlab_anda
GIT_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
```

Kemudian di kode `src/lib/git.ts` uncomment bagian init.

### 4. Run Development

```bash
npm run dev
```

Buka http://localhost:4321

## Deployment

### Build

```bash
npm run build
```

### Run Production

```bash
node dist/server/entry.mjs
```

### Environment Variables

Production butuh:

- `GIT_REPO_URL`: URL repo git (opsional, kalau udah clone manual)

### Deploy Options

**VPS/Server**

```bash
# Build
npm run build

# Run dengan PM2
pm2 start dist/server/entry.mjs --name obsidian-web

# Atau dengan systemd service
```

**Docker** (optional, bikin Dockerfile sendiri)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["node", "dist/server/entry.mjs"]
```

## Usage

1. Login dengan user yang dibuat
2. Browse file tree di sidebar
3. Klik note untuk baca
4. Search di search bar
5. Klik tombol Sync untuk pull update dari git

## Struktur Folder

```
obsidian-web/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Dashboard
│   │   ├── login.astro          # Login page
│   │   ├── notes/[...slug].astro # Note viewer
│   │   └── api/
│   │       ├── sync.ts          # Sync endpoint
│   │       └── logout.ts        # Logout endpoint
│   ├── components/
│   │   ├── FileTree.astro       # File tree
│   │   └── SearchBar.tsx        # Search component
│   └── lib/
│       ├── auth.ts              # Lucia auth
│       ├── git.ts               # Git operations
│       ├── vault.ts             # Vault operations
│       ├── markdown.ts          # Markdown processor
│       └── middleware.ts        # Auth middleware
├── vault/                       # Obsidian vault (git clone)
└── auth.db                      # SQLite auth database
```

## Tips

- Vault folder di-gitignore, jadi aman
- Password **TIDAK** di-hash (simple setup), jangan expose ke public
- Untuk production sebaiknya tambahin HTTPS
- Bisa tambahin nginx reverse proxy
- Search index di-build client-side, jadi fast

## Customization

### Ubah Theme

Edit CSS di masing-masing .astro file

### Tambah Custom Markdown Plugin

Edit `src/lib/markdown.ts`, tambah remark/rehype plugin

### Password Hashing

Ganti di `src/lib/auth.ts` dan `src/pages/login.astro` pakai bcrypt

## TODO (Optional Enhancements)

- [ ] Password hashing
- [ ] Auto sync interval
- [ ] Dark/Light theme toggle
- [ ] Mobile responsive improvements
- [ ] Tag filtering
- [ ] Recent notes widget
- [ ] Backlinks viewer
