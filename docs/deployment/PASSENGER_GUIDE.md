# Panduan Deployment di Domainesia (Passenger/cPanel)

Panduan ini khusus untuk deployment di hosting Domainesia yang menggunakan Passenger server melalui cPanel.

---

## Persiapan

Sebelum memulai, pastikan kamu sudah:

1. **Paket Hosting Super ke atas** (diperlukan untuk akses SSH)
2. Sudah setup **Turso Database** - lihat [TURSO_SETUP.md](./TURSO_SETUP.md)
3. Punya akses **SSH** ke hosting

---

## Step 1: Menentukan Lokasi Install

Decide apakah mau install di:
- **Domain utama**: `https://namadomain.com`
- **Subdomain**: `https://notes.namadomain.com`

Jika menggunakan subdomain, buat dulu di cPanel:
1. **Domains** → **Subdomains**
2. Buat subdomain, misal: `notes.namadomain.com`
3. Document Root: `/home/username/public_html`

---

## Step 2: Membuat Node.js App di cPanel

1. Login ke **cPanel**
2. Cari menu **"Setup Node.js App"**
3. Klik **"Create Application"**

Isi form dengan:

| Field                  | Value                                  |
| ---------------------- | -------------------------------------- |
| **Node.js version**    | Pilih versi terbaru (20.x atau 22.x)   |
| **Application mode**   | `Production`                           |
| **Application root**   | `obsidian-web` (nama folder)           |
| **Application URL**    | Domain/subdomain kamu                  |
| **Application startup file** | `app.mjs`                            |
| **Passenger log file** | `logs/passenger.log`                   |

Klik **"Create"**.

**PENTING**: Copy/Save path yang muncul di `Command for entering to virtual environment:`
Contoh: `source /home/username/nodevenv/obsidian-web/20/bin/activate`

---

## Step 3: Clone Repository via SSH

### 3.1 Akses SSH

Buka terminal (Linux/Mac) atau PuTTy (Windows):

```bash
ssh username@namadomain.com -p 64000
```

### 3.2 Clone Repository

```bash
# Masuk ke public_html
cd ~/public_html

# Clone repo (ganti dengan repo URL kamu)
git clone https://github.com/kaqfa/astro-obsidian.git obsidian-web
cd obsidian-web
```

---

## Step 4: Setup Environment Variables

Buat file `.env` di folder aplikasi:

```bash
nano .env
```

Isi dengan konfigurasi Turso kamu:

```bash
# Turso Database
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-token

# Git Vault Repository
GIT_REPO_URL=https://github.com/username/vault.git

# Environment
NODE_ENV=production

# HTTPS Protocol (set to 'true' if using HTTPS/SSL)
HTTPS=false
```

Tekan `Ctrl+O` lalu `Ctrl+X` untuk save dan exit (nano).

**PENTING**: Jika domain sudah menggunakan HTTPS/SSL certificate, set `HTTPS=true` agar cookies berfungsi dengan aman.

---

## Step 5: Masuk ke Node Environment

Masuk ke Node.js virtual environment (path yang dicopy dari Step 2):

```bash
source /home/username/nodevenv/obsidian-web/20/bin/activate
```

Prompt akan berubah menandakan kamu sudah di dalam Node environment.

---

## Step 6: Install Dependencies

```bash
NODE_ENV=production npm install
```

Tunggu proses selesai.

---

## Step 7: Build Application

Astro perlu di-build dulu untuk production:

```bash
npm run build
```

Ini akan membuat folder `dist/` berisi file yang sudah di-compile.

---

## Step 8: Initialize Database

```bash
# Run migration untuk create tables
npx tsx migrate.ts

# Create user admin
npx tsx setup.ts
```

Follow prompts untuk create user admin.

---

## Step 9: Clone Vault (Optional)

Jika vault di private repo:

```bash
# Clone vault
git clone https://github.com/username/vault.git vault
```

Atau biarkan aplikasi auto-sync saat pertama kali diakses.

---

## Step 10: Restart Application

Kembali ke cPanel:

1. **Setup Node.js App**
2. Cari aplikasi `obsidian-web`
3. Klik **"Restart"**

Selesai! Coba akses domain kamu.

---

## Troubleshooting

### Aplikasi tidak muncul / error

**1. Check Passenger logs:**

```bash
tail -f ~/public_html/obsidian-web/logs/passenger.log
```

**2. Pastikan file `app.mjs` ada:**

```bash
ls -la ~/public_html/obsidian-web/app.mjs
```

File `app.mjs` harus ada di root folder. Ini adalah entry point untuk Passenger.

**3. Pastikan build sudah berhasil:**

```bash
ls -la ~/public_html/obsidian-web/dist/server/entry.mjs
```

File `dist/server/entry.mjs` harus ada.

**4. Check Node.js version:**

Di cPanel, pastikan Node.js versi 20+ (Astro membutuhkan Node.js 18+).

**5. Restart melalui command line:**

```bash
mkdir -p ~/public_html/obsidian-web/tmp
touch ~/public_html/obsidian-web/tmp/restart.txt
```

### Database connection error

Pastikan environment variables sudah benar:

```bash
cat ~/public_html/obsidian-web/.env
```

Pastikan `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` valid.

### Port already in use

Passenger auto-assign port, tidak perlu config manual. Jika ada masalah, restart melalui cPanel.

### Permission error

```bash
chmod -R 755 ~/public_html/obsidian-web
```

### Redirect Loop (ERR_TOO_MANY_REDIRECTS)

Error ini terjadi karena session tidak tersimpan dengan baik. Solusi:

**1. Pastikan database sudah ter-initialize dengan benar:**

```bash
cd ~/public_html/obsidian-web
source /home/username/nodevenv/obsidian-web/20/bin/activate

# Cek apakah migration sudah dijalankan
npx tsx migrate.ts
```

**2. Cek environment variables - pastikan HTTPS sesuai:**

```bash
cat .env | grep HTTPS
```

- Jika menggunakan HTTP (tanpa SSL): `HTTPS=false`
- Jika menggunakan HTTPS (dengan SSL): `HTTPS=true`

**3. Cek apakah ada user di database:**

```bash
npx tsx -e "import { db } from './dist/lib/db/index.js'; import { userTable } from './dist/lib/db/schema.js'; const users = await db.select().from(userTable); console.log('Users:', users);"
```

Jika tidak ada user, jalankan setup:

```bash
npx tsx setup.ts
```

**4. Restart aplikasi:**

```bash
touch tmp/restart.txt
```

**5. Clear cookies di browser:**

- Buka Developer Tools (F12)
- Application → Cookies → Remove all
- Refresh dan coba login lagi

---

## Update Aplikasi

Untuk update aplikasi ke versi terbaru:

```bash
# SSH ke server
ssh username@namadomain.com -p 64000

# Masuk ke folder
cd ~/public_html/obsidian-web

# Masuk ke Node environment
source /home/username/nodevenv/obsidian-web/20/bin/activate

# Pull latest code
git pull

# Install dependencies baru (jika ada)
NODE_ENV=production npm install

# Re-build
npm run build

# Run migration jika ada perubahan database
npx tsx migrate.ts

# Restart Passenger
touch tmp/restart.txt
```

---

## Struktur File Akhir

Setelah deployment, struktur folder akan terlihat seperti ini:

```
~/public_html/obsidian-web/
├── app.mjs                # Entry point untuk Passenger
├── package.json
├── package-lock.json
├── .env                   # Environment variables (RAHASIA!)
├── migrate.ts
├── setup.ts
├── dist/                  # Build output
│   ├── client/
│   ├── server/
│   │   └── entry.mjs     # Server entry point
│   └── ...
├── node_modules/
├── vault/                 # Obsidian vault (git clone)
├── local.db              # Local database (development only, tidak dipakai di production)
├── logs/
│   └── passenger.log
└── tmp/
    └── restart.txt
```

---

## Catatan Penting

1. **Environment Variables**: File `.env` berisi credentials Turso. JANGAN di-commit ke git!
2. **Build Harus di-rollback**: Setiap `git pull`, WAJIB jalankan `npm run build` ulang.
3. **Migration**: Jika ada perubahan database structure, jalankan `npx tsx migrate.ts` setelah pull.
4. **Logs**: Selalu cek `logs/passenger.log` jika ada error.
5. **Node.js Version**: Astro membutuhkan Node.js 18.x atau lebih tinggi.

---

## Deploy Alternatif: Subdirectory

Jika mau deploy di subdirectory seperti `namadomain.com/notes`:

1. Install di folder `public_html/notes` atau `public_html/obsidian-web`
2. Di cPanel Node.js App, set Application URL ke domain utama
3. Pastikan `astro.config.mjs` sudah di-set untuk base path:

```javascript
// astro.config.mjs
export default defineConfig({
  base: '/notes',  // Hapus ini jika di root
  // ...
});
```

---

## Support

Jika mengalami masalah:

1. Cek logs: `tail -f logs/passenger.log`
2. Cek error browser: F12 → Console
3. Hubungi support Domainesia jika ada isu dengan Node.js/Passenger
4. Cek dokumentasi Astro: https://docs.astro.build
