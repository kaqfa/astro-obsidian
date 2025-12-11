# PM2 Deployment Guide

## Setup PM2 di Server

### 1. Install PM2 (Global)

```bash
# Via npm
npm install -g pm2

# Atau via yarn
yarn global add pm2
```

### 2. Setup Aplikasi

```bash
cd /path/to/mp-fahri

# Install dependencies dulu
npm install --production

# Setup .env
cp .env.example .env
nano .env  # Edit dengan credentials

# Initialize database
npx tsx migrate.ts
npx tsx setup.ts

# Clone vault (atau biarkan kosong, akan auto-clone dari sync button)
git clone <vault-url> vault
```

### 3. Start dengan PM2

```bash
# Create logs directory
mkdir -p logs

# Start app
pm2 start ecosystem.config.js

# Atau manual:
pm2 start dist/server/entry.mjs --name obsidian-web
```

### 4. Save PM2 Process List

```bash
# Save current processes
pm2 save

# Setup PM2 to start on server reboot
pm2 startup

# Ikuti instruksi yang muncul (copy-paste command yang diberikan)
```

---

## PM2 Commands

### Basic Commands

```bash
# List apps
pm2 list

# Monitor apps
pm2 monit

# Show logs
pm2 logs obsidian-web

# Show logs realtime
pm2 logs obsidian-web --lines 50

# Stop app
pm2 stop obsidian-web

# Restart app
pm2 restart obsidian-web

# Reload (zero downtime)
pm2 reload obsidian-web

# Delete app from PM2
pm2 delete obsidian-web

# Show app info
pm2 show obsidian-web
```

### Update Aplikasi (Deploy Update)

```bash
# Pull latest code
git pull

# Install dependencies (jika ada perubahan)
npm install --production

# Reload app (zero downtime)
pm2 reload obsidian-web

# Atau restart
pm2 restart obsidian-web
```

---

## Troubleshooting

### Check Status

```bash
pm2 status
```

### View Logs

```bash
# Error logs
pm2 logs obsidian-web --err

# Output logs
pm2 logs obsidian-web --out

# Clear logs
pm2 flush
```

### Restart jika Error

```bash
# Restart app
pm2 restart obsidian-web

# Atau restart semua
pm2 restart all
```

---

## Advanced Configuration

### Auto Restart on File Changes (Development saja)

Edit `ecosystem.config.js`:

```js
watch: true,
ignore_watch: ['node_modules', 'logs', 'vault']
```

### Multiple Instances (Load Balancing)

Edit `ecosystem.config.js`:

```js
instances: 'max',  // Atau angka spesifik: 2, 4, dll
exec_mode: 'cluster'
```

### Custom Environment Variables

Edit `ecosystem.config.js`:

```js
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  TURSO_DATABASE_URL: 'libsql://....turso.io'
}
```

---

## PM2 Web Dashboard (Optional)

```bash
# Install PM2 Plus (gratis untuk 1 server)
pm2 link <secret_key> <public_key>

# Atau pakai PM2 web interface
pm2 web
```

---

## Uninstall PM2

```bash
# Stop all apps
pm2 kill

# Remove PM2 startup
pm2 unstartup

# Uninstall
npm uninstall -g pm2
```
