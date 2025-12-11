# Testing Passenger Locally (macOS)

Panduan ini untuk testing Passenger deployment di komputer lokal sebelum deploy ke server production.

---

## Kenapa Test di Local?

1. ✅ Detect masalah sebelum deploy ke server
2. ✅ Test entry point (`app.mjs`) apakah benar
3. ✅ Verify environment variables setup
4. ✅ Check compatibility dengan Passenger
5. ✅ Debug error lebih mudah (akses penuh ke logs)

---

## Option 1: Passenger Standalone (Recommended untuk Testing)

### Step 1: Install Passenger Standalone

```bash
# Install via Homebrew
brew install passenger

# Verify installation
passenger -v
# Expected output: Phusion Passenger 6.x.x
```

### Step 2: Build Aplikasi

```bash
cd /path/to/obsidian-web

# Build production
npm run build

# Pastikan dist/ terbuat
ls -la dist/
```

### Step 3: Setup Environment

```bash
# Copy dan edit .env
cp .env.example .env
nano .env

# Isi:
# TURSO_DATABASE_URL=file:local.db
# GIT_REPO_URL=https://github.com/your/vault.git
# NODE_ENV=production
```

### Step 4: Initialize Database

```bash
# Run migration
npx tsx migrate.ts

# Create user
npx tsx setup.ts
```

### Step 5: Clone Vault (jika belum ada)

```bash
# Clone vault ke folder vault/
git clone <your-vault-url> vault

# Atau biarkan kosong, akan di-clone via sync button
```

### Step 6: Test dengan Passenger Standalone

```bash
# Start Passenger Standalone
passenger start

# Output akan tampil:
# =============== Phusion Passenger Standalone web server started ===============
# PID file: /path/to/passenger.pid
# Log file: /path/to/passenger.log
# Environment: production
# Accessible via: http://0.0.0.0:3000/
# You can stop Passenger Standalone by pressing Ctrl-C.
```

### Step 7: Test di Browser

```bash
# Buka browser ke:
http://localhost:3000

# Test:
1. Login
2. Browse vault
3. Search
4. Sync button
5. Wikilinks
6. Code highlighting
7. ToC
```

### Step 8: Check Logs (Jika Ada Error)

```bash
# Real-time logs
tail -f log/passenger.log

# Atau check di terminal Passenger
```

### Step 9: Stop Passenger

```bash
# Di terminal Passenger, tekan:
Ctrl+C

# Atau kill process:
passenger stop
```

---

## Option 2: Passenger + Nginx (Lebih Mirip Production)

### Step 1: Install Passenger + Nginx

```bash
# Install Passenger Nginx module
brew install passenger nginx

# Setup Passenger Nginx
# Ikuti instruksi yang muncul untuk compile nginx dengan Passenger
```

### Step 2: Configure Nginx

Create `/usr/local/etc/nginx/servers/obsidian-web.conf`:

```nginx
server {
    listen 8080;
    server_name localhost;

    root /Users/yourusername/path/to/obsidian-web/public;

    passenger_enabled on;
    passenger_app_root /Users/yourusername/path/to/obsidian-web;
    passenger_startup_file app.mjs;
    passenger_app_type node;
    passenger_app_env production;

    # Environment variables
    passenger_env_var TURSO_DATABASE_URL "file:local.db";
    passenger_env_var GIT_REPO_URL "https://github.com/your/vault.git";
    passenger_env_var NODE_ENV "production";
}
```

### Step 3: Test Nginx Config

```bash
# Test configuration
sudo nginx -t

# Jika OK, reload
sudo nginx -s reload

# Atau restart
sudo brew services restart nginx
```

### Step 4: Access Application

```bash
# Browser:
http://localhost:8080
```

---

## Troubleshooting Local Testing

### Error: "Cannot find module 'app.mjs'"

**Cause:** Entry point salah atau tidak ada

**Fix:**

```bash
# Check apakah app.mjs ada
ls -la app.mjs

# Pastikan isinya correct:
cat app.mjs
# Should export default handler from dist/server/entry.mjs
```

### Error: "Passenger could not be started"

**Cause:** Node.js version atau dependency issue

**Fix:**

```bash
# Check Node.js version
node -v  # Harus 18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --production
```

### Error: Database errors

**Cause:** Migration belum jalan atau database file tidak accessible

**Fix:**

```bash
# Re-run migration
npx tsx migrate.ts

# Check file permissions
ls -la local.db
chmod 644 local.db
```

### Error: "Port already in use"

**Cause:** Ada process lain di port 3000

**Fix:**

```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9

# Atau gunakan port lain:
passenger start --port 3001
```

### Error: Git sync fails

**Cause:** Git credentials atau network

**Fix:**

```bash
# Test manual git pull di vault/
cd vault
git pull

# Check credentials di .env
cat .env | grep GIT
```

### Error: "Cannot find dist/server/entry.mjs"

**Cause:** Build belum jalan atau failed

**Fix:**

```bash
# Re-build
npm run build

# Check hasil build
ls -la dist/server/entry.mjs
```

---

## Comparison: Local vs Production

| Aspect      | Local Passenger      | Production (cPanel)                          |
| ----------- | -------------------- | -------------------------------------------- |
| Entry Point | `app.mjs`            | `app.mjs`                                    |
| Environment | `.env` file          | cPanel env vars atau `.env`                  |
| Database    | Local SQLite         | Local SQLite atau Turso                      |
| Vault       | Local clone          | Clone di server                              |
| Logs        | Terminal atau `log/` | `logs/passenger.log`                         |
| Port        | 3000 (default)       | Auto-assigned by cPanel                      |
| Restart     | `passenger restart`  | cPanel Restart button atau `tmp/restart.txt` |

---

## Checklist Sebelum Deploy ke Server

Setelah test di local dan semua OK, checklist ini:

- [ ] `app.mjs` functional di local Passenger
- [ ] Login/logout works
- [ ] File tree navigation works
- [ ] Notes rendering correctly (markdown, wikilinks, code, ToC)
- [ ] Search functional
- [ ] Sync button works (pull from Git)
- [ ] Mermaid diagrams render
- [ ] No console errors di browser
- [ ] Database schema correct (user, session tables)
- [ ] Environment variables loaded
- [ ] Vault accessible

Kalau semua ✅, baru push ke server!

---

## Deploy ke Server Setelah Local OK

```bash
# 1. Build deployment package
./deploy.sh

# 2. Push ke GitLab
cd deploy
git add .
git commit -m "production build - tested locally"
git push

# 3. Di server, pull latest
cd ~/public_html/obsidian-web
git pull

# 4. Restart via cPanel Node.js App
# Atau via SSH:
touch tmp/restart.txt
```

---

## Debugging Tips

### Enable Passenger Debug Mode

```bash
# Start dengan verbose logging
passenger start --log-level 3

# Atau di Passengerfile.json:
{
  "log_level": 3
}
```

### Check Passenger Status

```bash
# Show running apps
passenger-status

# Show Passenger memory usage
passenger-memory-stats
```

### Monitor Logs Real-time

```bash
# Watch Passenger logs
tail -f log/passenger.log

# Watch app output
tail -f log/production.log  # jika ada
```

---

## Alternative: Test dengan Node Directly (Sanity Check)

Sebelum test Passenger, sanity check dulu:

```bash
# Test direct Node.js
node dist/server/entry.mjs

# Browser:
http://localhost:4321

# Kalau ini works, berarti build OK
# Kalau ini gagal, masalah bukan di Passenger
```

---

## Summary

**Workflow yang Benar:**

1. ✅ Test dengan `node dist/server/entry.mjs` (sanity check)
2. ✅ Test dengan `passenger start` (verify Passenger compatibility)
3. ✅ Fix any errors di local
4. ✅ Push ke deployment repo
5. ✅ Deploy ke server dengan confidence

Dengan testing di local dulu, Anda bisa:

- Identify issues early
- Debug dengan mudah (full access)
- Iterate faster (no server downtime)
- Deploy dengan confidence (sudah tested)
