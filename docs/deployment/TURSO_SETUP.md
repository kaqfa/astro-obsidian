# Turso Database Setup Guide

## Development (Local SQLite)

Untuk development lokal, Anda tidak perlu setup Turso. Database akan otomatis dibuat di `local.db`:

```bash
# Install dependencies
npm install

# Run migration
npx tsx migrate.ts

# Create user
npx tsx setup.ts

# Start dev server
npm run dev
```

## Production (Turso Cloud)

### 1. Buat Akun Turso

Daftar di [https://turso.tech](https://turso.tech) (gratis untuk 9GB)

### 2. Install Turso CLI

```bash
# macOS
brew install tursodatabase/tap/turso

# Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows
irm get.tur.so/install.ps1 | iex
```

### 3. Login & Buat Database

```bash
# Login
turso auth login

# Buat database
turso db create obsidian-web

# Dapatkan URL
turso db show obsidian-web --url

# Buat auth token
turso db tokens create obsidian-web
```

### 4. Update Environment Variables

Buat file `.env`:

```bash
# Copy dari example
cp .env.example .env

# Edit .env
TURSO_DATABASE_URL=libsql://[your-db].turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-token
GIT_REPO_URL=https://github.com/yourusername/your-vault.git
```

### 5. Run Migration & Setup

```bash
# Run migration untuk create tables
npx tsx migrate.ts

# Create initial user
npx tsx setup.ts

# Start server
npm start
```

## Environment Variables

| Variable             | Required | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| `TURSO_DATABASE_URL` | No       | Default: `file:local.db` (local SQLite)  |
| `TURSO_AUTH_TOKEN`   | No       | Required jika menggunakan Turso cloud    |
| `GIT_REPO_URL`       | Yes      | URL repository Obsidian vault            |
| `GIT_USERNAME`       | No       | Username untuk private repository        |
| `GIT_TOKEN`          | No       | Personal access token untuk private repo |

## Troubleshooting

### Error: "Cannot connect to Turso"

Pastikan:

1. URL database benar (format: `libsql://....turso.io`)
2. Auth token valid (buat ulang jika perlu: `turso db tokens create obsidian-web`)
3. Database sudah dibuat: `turso db list`

### Development ke Production

Untuk deploy dari local:

```bash
# Export local database (optional)
sqlite3 local.db .dump > backup.sql

# Upload ke Turso
turso db shell obsidian-web < backup.sql
```
