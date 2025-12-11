# Deployment Guide - Shared Hosting (cPanel/Hostinger/dll)

## Masalah dengan Shared Hosting

Shared hosting sering punya limitasi:

- Node.js virtual environment yang incomplete
- Tidak bisa compile native modules
- File system permissions terbatas

## Solusi: Pre-Built Deployment

Build di komputer lokal, upload hasil build.

### Step 1: Build di Local

```bash
# Di komputer Anda
git pull
npm install
npm run build

# Akan generate folder dist/
```

### Step 2: Prepare untuk Upload

Buat folder baru untuk deployment:

```bash
mkdir deploy
cp -r dist deploy/
cp package.json deploy/
cp -r src deploy/  # Astro butuh src untuk server-side rendering
cp astro.config.mjs deploy/
cp tsconfig.json deploy/
```

### Step 3: Upload ke Hosting

Via FTP/cPanel File Manager, upload folder `deploy/` ke hosting Anda.

### Step 4: Install Dependencies di Hosting

SSH ke hosting:

```bash
cd /path/to/deploy
npm install --production
```

### Step 5: Setup Environment Variables

Buat file `.env`:

```bash
TURSO_DATABASE_URL=libsql://....turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
GIT_REPO_URL=https://github.com/user/vault.git
NODE_ENV=production
```

### Step 6: Run Migration & Setup

```bash
# Install tsx if needed
npm install -g tsx

# Run migration
npx tsx migrate.ts

# Create user
npx tsx setup.ts
```

### Step 7: Start Server

#### Opsi A: Manual (Testing)

```bash
node dist/server/entry.mjs
```

#### Opsi B: PM2 (Production)

```bash
npm install -g pm2
pm2 start dist/server/entry.mjs --name obsidian-web
pm2 save
pm2 startup
```

#### Opsi C: Node.js App di cPanel

Di cPanel:

1. Setup Node.js App
2. App Root: `/home/user/deploy`
3. Application Startup File: `dist/server/entry.mjs`
4. Environment variables: paste dari `.env`
5. Restart app

---

## Update ke Versi Baru

```bash
# Di local
git pull
npm install
npm run build

# Upload ulang folder dist/ ke hosting
# Restart app
```

---

## Alternative: Deploy ke Platform Lain

Jika shared hosting terlalu ribet, coba platform ini:

### Railway (Recommended)

- ✅ Free tier
- ✅ Auto-deploy dari GitHub
- ✅ Support Turso
- ✅ Built-in logs & monitoring

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
```

### Render

1. Connect GitHub repo
2. Build command: `npm run build`
3. Start command: `node dist/server/entry.mjs`
4. Environment variables: paste dari `.env`
