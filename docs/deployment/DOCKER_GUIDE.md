# Docker Deployment Guide

Simple Docker deployment untuk VPS.

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/kaqfa/astro-obsidian.git
cd astro-obsidian
```

### 2. Setup Environment

```bash
cp .env.example .env
nano .env
```

Isi `.env`:

```bash
TURSO_DATABASE_URL=file:/app/data/local.db
GIT_REPO_URL=https://gitlab.com/kaqfa/vault.git
GIT_USERNAME=kaqfa
GIT_TOKEN=your-token
NODE_ENV=production
```

### 3. Run with Docker Compose

```bash
# Build dan start container
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 4. Initialize Database (First Time Only)

```bash
# Exec into container
docker exec -it obsidian-web sh

# Run migration
npx tsx migrate.ts

# Create user
npx tsx setup.ts

# Exit
exit
```

### 5. View Application

Buka browser: `http://your-server-ip:4321`

---

## Manual Docker Commands (Tanpa Compose)

### Build Image

```bash
docker build -t obsidian-web .
```

### Run Container

```bash
docker run -d \
  --name obsidian-web \
  -p 4321:4321 \
  -e NODE_ENV=production \
  -e GIT_REPO_URL=https://gitlab.com/kaqfa/vault.git \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/vault:/app/vault \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  obsidian-web
```

---

## Useful Commands

```bash
# View logs
docker logs -f obsidian-web

# Stop container
docker stop obsidian-web

# Start container
docker start obsidian-web

# Restart container
docker restart obsidian-web

# Remove container
docker rm -f obsidian-web

# Exec into container
docker exec -it obsidian-web sh

# View running containers
docker ps
```

---

## Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## Nginx Reverse Proxy (Optional)

Untuk custom domain dengan SSL:

```nginx
# /etc/nginx/sites-available/obsidian-web
server {
    listen 80;
    server_name notes.yourdomain.com;

    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable dan setup SSL:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/obsidian-web /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Setup SSL with Certbot
sudo certbot --nginx -d notes.yourdomain.com
```

---

## Troubleshooting

### Container tidak start

```bash
# Check logs
docker logs obsidian-web

# Check if port already used
sudo lsof -i :4321
```

### Database error

```bash
# Recreate database
docker exec -it obsidian-web npx tsx migrate.ts
```

### Vault tidak ter-sync

```bash
# Clone manual di container
docker exec -it obsidian-web sh
git clone https://gitlab.com/kaqfa/vault.git vault
exit
```

### Permissions error

```bash
# Fix permissions
sudo chown -R $USER:$USER vault/ data/ logs/
```

---

## Production Tips

1. **Use Turso Cloud** untuk database (lebih reliable):

   ```bash
   TURSO_DATABASE_URL=libsql://....turso.io
   TURSO_AUTH_TOKEN=your-token
   ```

2. **Setup auto-restart**:

   ```yaml
   # docker-compose.yml
   restart: always
   ```

3. **Limit resources** (jika VPS kecil):

   ```yaml
   deploy:
     resources:
       limits:
         cpus: "0.5"
         memory: 512M
   ```

4. **Backup database regularly**:
   ```bash
   # Backup script
   docker exec obsidian-web cat /app/data/local.db > backup-$(date +%F).db
   ```

---

## Uninstall

```bash
# Stop dan remove container
docker-compose down

# Remove images
docker rmi obsidian-web

# Remove volumes (HATI-HATI: ini hapus data!)
rm -rf data/ vault/ logs/
```
