# Passenger Deployment Guide

## Passenger adalah aplikasi server yang umum di shared hosting (cPanel, Plesk, dll)

---

## Setup di cPanel (Recommended)

### 1. Clone Repository

Di cPanel File Manager atau via SSH:

```bash
cd ~/public_html  # atau ~/domains/yourdomain.com/public_html
git clone https://gitlab.com/kaqfa/mp-fahri.git obsidian-web
cd obsidian-web
```

### 2. Setup Node.js App di cPanel

1. Login ke **cPanel**
2. Cari **"Setup Node.js App"** (di Software section)
3. Klik **"Create Application"**

**Isi form:**

- **Node.js version**: Pilih yang terbaru (18.x atau 20.x)
- **Application mode**: Production
- **Application root**: `obsidian-web` (atau path lengkap)
- **Application URL**: Domain/subdomain Anda
- **Application startup file**: `app.mjs`
- **Passenger log file**: `logs/passenger.log`

4. Klik **"Create"**

### 3. Setup Environment Variables

Masih di halaman Node.js App, scroll ke **"Environment Variables"**:

Tambahkan:

```
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
GIT_REPO_URL=https://gitlab.com/kaqfa/vault.git
NODE_ENV=production
```

(Atau edit `.env` via File Manager / SSH)

### 4. Install Dependencies

Di halaman Node.js App, ada tombol **"Run NPM Install"** atau via terminal:

```bash
# Enter virtual environment (cPanel will show the command)
source /home/username/nodevenv/obsidian-web/24/bin/activate

# Install dependencies
npm install --production
```

### 5. Initialize Database

```bash
# Still in virtual environment
npx tsx migrate.ts
npx tsx setup.ts
```

### 6. Clone Vault (Optional)

```bash
git clone https://gitlab.com/kaqfa/vault.git vault
```

### 7. Restart App

Di cPanel Node.js App, klik tombol **"Restart"**.

Selesai! Aplikasi sekarang running.

---

## Deployment via SSH (Manual)

Jika Anda punya SSH access:

```bash
# 1. Clone repo
cd ~/public_html
git clone https://gitlab.com/kaqfa/mp-fahri.git obsidian-web
cd obsidian-web

# 2. Create logs directory
mkdir -p logs

# 3. Setup environment
cp .env.example .env
nano .env  # Edit dengan credentials

# 4. Install dependencies
npm install --production

# 5. Initialize database
npx tsx migrate.ts
npx tsx setup.ts

# 6. Clone vault
git clone <vault-url> vault

# 7. Restart Passenger
# Via cPanel restart button, atau:
mkdir -p tmp
touch tmp/restart.txt
```

---

## Update Aplikasi

### Via cPanel:

1. **SSH atau File Manager**: `git pull` di folder aplikasi
2. **Node.js App page**: Klik **"Run NPM Install"** (jika ada dependency baru)
3. Klik **"Restart"**

### Via SSH:

```bash
cd ~/public_html/obsidian-web
git pull
npm install --production
touch tmp/restart.txt  # Restart Passenger
```

---

## Troubleshooting

### Aplikasi tidak jalan

1. **Check logs**:

   ```bash
   tail -f logs/passenger.log
   ```

2. **Check Node.js version**:
   - Pastikan Node.js 18+ di cPanel
   - Check: `node --version`

3. **Check permissions**:

   ```bash
   chmod -R 755 ~/public_html/obsidian-web
   ```

4. **Restart app**:
   - Via cPanel: Klik "Restart"
   - Via SSH: `touch tmp/restart.txt`

### Database error

```bash
# Re-run migration
npx tsx migrate.ts
```

### Port already in use

- Passenger auto-assign port, tidak perlu config manual
- Jika ada konflik, restart via cPanel

---

## Custom Domain / Subdomain

### Setup di cPanel:

1. **Domains** → **Subdomains** (atau Addon Domains)
2. Buat subdomain: `notes.yourdomain.com`
3. Document Root: `/home/username/public_html/obsidian-web/public`
4. Di **Node.js App**, edit **Application URL** ke subdomain baru
5. Restart app

### .htaccess (jika perlu custom routing):

Passenger biasanya handle ini otomatis, tapi jika perlu:

```apache
# .htaccess di public_html/obsidian-web/
PassengerEnabled on
PassengerAppRoot /home/username/public_html/obsidian-web
PassengerStartupFile app.mjs
PassengerAppType node
PassengerNodeOptions --experimental-modules
```

---

## Performance Tips

1. **Enable caching** di `.htaccess`:

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/* "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

2. **Set max pool size** (jika shared resources terbatas):
   - Edit di cPanel Node.js App settings
   - Atau di `Passengerfile.json`: `max-pool-size: 1`

---

## Uninstall / Remove

1. **Stop app** di cPanel Node.js App
2. **Remove application**
3. **Delete files**:
   ```bash
   rm -rf ~/public_html/obsidian-web
   ```
