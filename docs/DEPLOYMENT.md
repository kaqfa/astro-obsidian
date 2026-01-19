# Deployment Guide - Domainesia via GitHub Actions

Panduan lengkap untuk setup CI/CD deployment otomatis ke Domainesia menggunakan GitHub Actions.

---

## 📋 Prerequisites

Sebelum setup CI/CD, pastikan sudah punya:

1. **Server Domainesia** dengan:
   - Node.js 20+ terinstall
   - Git terinstall
   - SSH access enabled
   - Passenger/cPanel Node.js App configured

2. **GitHub Repository** dengan:
   - Admin access
   - Ability to add secrets

3. **Local Machine** dengan:
   - SSH client
   - Git

---

## 🔐 Step 1: Generate SSH Key untuk GitHub Actions

Di local machine, generate SSH key khusus untuk GitHub Actions:

```bash
# Generate SSH key (gunakan ed25519 untuk security yang lebih baik)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_domainesia

# Akan generate 2 files:
# - github_actions_domainesia (private key) ← untuk GitHub Secrets
# - github_actions_domainesia.pub (public key) ← untuk server
```

**PENTING:** Jangan set passphrase (tekan Enter saat diminta), karena GitHub Actions butuh key tanpa passphrase.

---

## 🚀 Step 2: Setup SSH Key di Server Domainesia

### Option A: Via cPanel File Manager

1. Login ke cPanel
2. Buka **File Manager**
3. Navigate ke home directory
4. Buka folder `.ssh` (atau buat jika belum ada):
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   ```

5. Edit file `authorized_keys`:
   ```bash
   nano ~/.ssh/authorized_keys
   ```

6. Copy isi dari `github_actions_domainesia.pub` dan paste ke akhir file
7. Save dan set permission:
   ```bash
   chmod 600 ~/.ssh/authorized_keys
   ```

### Option B: Via SSH Terminal

```bash
# Copy public key ke server
cat ~/.ssh/github_actions_domainesia.pub | ssh user@your-domain.com 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'

# Set correct permissions
ssh user@your-domain.com 'chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'
```

### Verify SSH Connection

Test koneksi dari local machine:

```bash
ssh -i ~/.ssh/github_actions_domainesia user@your-domain.com

# Jika berhasil, kamu akan masuk ke server tanpa password
```

---

## 🔑 Step 3: Add GitHub Secrets

1. Buka GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add secrets berikut:

### Required Secrets:

#### `SSH_HOST`
**Value:** IP address atau domain server Domainesia
```
Example: 103.xxx.xxx.xxx
atau: ssh.domainesia.com
```

#### `SSH_USER`
**Value:** Username SSH kamu
```
Example: username123
```

#### `SSH_PRIVATE_KEY`
**Value:** Isi LENGKAP dari private key

```bash
# Copy isi private key:
cat ~/.ssh/github_actions_domainesia

# Copy SEMUA output, termasuk:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... content ...
# -----END OPENSSH PRIVATE KEY-----
```

**Paste EXACT content** ke GitHub secret (termasuk baris BEGIN dan END).

#### `SSH_PORT` (Optional)
**Value:** SSH port (default: 22)
```
Default: 22
Jika berbeda: 2222 atau port lain yang dikonfigurasi
```

#### `DEPLOY_PATH`
**Value:** Full path ke direktori aplikasi di server

```
Example: /home/username/public_html/obsidian-web
atau: /home/username/apps/obsidian-web
```

### How to Get `DEPLOY_PATH`:

```bash
# SSH ke server
ssh user@your-domain.com

# Check current directory
pwd

# Navigate ke app directory
cd public_html/obsidian-web
pwd

# Copy output dari pwd sebagai DEPLOY_PATH
```

---

## ✅ Step 4: Verify Setup

### Test GitHub Actions Workflow

1. **Manual Trigger** (recommended untuk first test):
   - Go to **Actions** tab di GitHub
   - Select **Deploy to Domainesia** workflow
   - Click **Run workflow** → **Run workflow**
   - Tunggu dan monitor logs

2. **Auto Trigger** (setelah manual test berhasil):
   - Push commit ke branch `main`
   - Workflow akan otomatis run
   - Check **Actions** tab untuk progress

### Check Deployment Logs

Di GitHub Actions logs, cari output berikut:

```
✅ Successful indicators:
- ⬇️  Pulling latest code...
- 📦 Installing dependencies...
- 🗄️  Running database migrations...
- 🔄 Restarting Passenger app...
- ✅ Deployment completed at [timestamp]
- 🎉 Application is now live!
```

### Verify on Server

SSH ke server dan check:

```bash
cd /home/username/apps/obsidian-web

# Check if latest code is deployed
git log -1

# Check if dist exists
ls -lah dist/

# Check restart file
ls -lah tmp/restart.txt

# Check Passenger status (if available)
passenger-status
```

---

## 🔧 Troubleshooting

### Issue: "Permission denied (publickey)"

**Cause:** SSH key tidak terkonfigurasi dengan benar

**Solution:**
```bash
# Verify public key ada di server:
ssh user@server 'cat ~/.ssh/authorized_keys'

# Check permission:
ssh user@server 'ls -la ~/.ssh'
# Should show:
# drwx------ (700) for .ssh directory
# -rw------- (600) for authorized_keys file

# Fix permission if needed:
ssh user@server 'chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'
```

### Issue: "Host key verification failed"

**Cause:** Server belum ada di known_hosts GitHub Actions

**Solution:** Workflow sudah include `script_stop: true` yang akan handle ini otomatis.

Atau tambahkan di workflow (sebelum deploy step):

```yaml
- name: Add server to known_hosts
  run: |
    mkdir -p ~/.ssh
    ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
```

### Issue: "Directory not found" during deployment

**Cause:** `DEPLOY_PATH` salah atau directory tidak exist

**Solution:**
```bash
# SSH ke server
ssh user@server

# Buat directory jika belum ada:
mkdir -p /home/username/apps/obsidian-web

# Clone repository pertama kali:
cd /home/username/apps
git clone https://github.com/yourusername/astro-obsidian.git obsidian-web
cd obsidian-web

# Setup .env
cp .env.example .env
nano .env  # Edit dengan environment variables

# Run initial setup
npm ci --production --legacy-peer-deps
npm run build
npx tsx migrate.ts
npx tsx setup.ts

# Create tmp directory for Passenger
mkdir -p tmp
touch tmp/restart.txt
```

### Issue: "npm: command not found"

**Cause:** Node.js/npm tidak ada di PATH

**Solution:**
```bash
# Check Node.js version di server:
ssh user@server 'which node && node -v'

# Jika tidak found, load Node.js environment:
# Tambahkan di workflow script SEBELUM npm commands:

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20  # atau version yang terinstall

# Atau tambahkan full path:
/home/username/.nvm/versions/node/v20.x.x/bin/npm ci
```

### Issue: Build succeeds but app doesn't restart

**Cause:** Passenger tidak detect perubahan `tmp/restart.txt`

**Solution:**
```bash
# Check Passenger configuration di cPanel:
# - App Root: /home/username/apps/obsidian-web
# - App Startup File: app.mjs
# - Node.js Version: 20.x

# Manual restart via cPanel:
# 1. Go to cPanel → Setup Node.js App
# 2. Click "Restart" button untuk app kamu

# Or via SSH:
cd /home/username/apps/obsidian-web
mkdir -p tmp
touch tmp/restart.txt

# Force restart with timestamp:
touch tmp/restart.txt
stat tmp/restart.txt  # Should show current timestamp
```

### Issue: "Migration failed"

**Cause:** Database sudah ada atau migration error

**Solution:**
```bash
# SSH ke server
cd /home/username/apps/obsidian-web

# Check database:
ls -lah local.db  # atau check Turso connection

# Manual migration:
npx tsx migrate.ts

# Jika error "table already exists" - OK, ignore
# Jika error lain - check logs dan fix
```

---

## 🔄 Deployment Flow

```
1. Developer pushes to main branch
   ↓
2. GitHub Actions triggered
   ↓
3. Run tests, lint, typecheck
   ↓
4. Build project (npm run build)
   ↓
5. Connect to Domainesia via SSH
   ↓
6. Pull latest code (git pull)
   ↓
7. Install dependencies (npm ci)
   ↓
8. Copy dist/ to server (via SCP)
   ↓
9. Run migrations (if any)
   ↓
10. Restart Passenger (touch tmp/restart.txt)
   ↓
11. Verify deployment
   ↓
12. ✅ Live!
```

---

## 📚 Best Practices

### 1. Test Locally First

Sebelum push ke main, test locally:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run preview  # Test built version
```

### 2. Use Staging Branch

Setup staging environment untuk test sebelum production:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [staging]
```

### 3. Database Backups

Backup database sebelum migration:

```bash
# Manual backup via SSH:
cd /home/username/apps/obsidian-web
cp local.db local.db.backup.$(date +%Y%m%d_%H%M%S)
```

### 4. Monitor Deployments

- Check GitHub Actions logs regularly
- Setup notifications (email/Slack) untuk deployment failures
- Monitor server logs: `tail -f logs/error.log`

### 5. Rollback Strategy

Jika deployment bermasalah:

```bash
# SSH ke server
cd /home/username/apps/obsidian-web

# Check available backups
ls -lt dist.backup.*

# Rollback ke backup sebelumnya
rm -rf dist
cp -r dist.backup.20240115_123456 dist

# Restart Passenger
touch tmp/restart.txt
```

---

## 🎯 Next Steps

Setelah CI/CD berjalan:

1. ✅ Test deployment dengan push commit kecil
2. ✅ Verify app berjalan dengan benar
3. ✅ Setup monitoring (uptime, logs)
4. ✅ Document custom environment variables
5. ✅ Setup database backup schedule

---

## 📞 Support

Jika ada issue:

1. Check **GitHub Actions logs** untuk error details
2. SSH ke server dan check **app logs**
3. Check **cPanel error logs** (if using cPanel)
4. Create issue di GitHub repository dengan:
   - Error message
   - Deployment logs
   - Server environment info

---

## 🔒 Security Notes

- ✅ **Private key** harus tetap di GitHub Secrets, JANGAN commit ke repository
- ✅ **Public key** di server harus readonly (chmod 600)
- ✅ **SSH port** jika custom, jangan expose publicly tanpa firewall
- ✅ **.env file** dengan secrets harus di-gitignore dan setup manual di server
- ✅ **Database backups** sebelum setiap migration

---

**Happy Deploying! 🚀**
