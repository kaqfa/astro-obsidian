# 📚 Obsidian Web Viewer

Modern web-based viewer for Obsidian vaults with **SPA experience**, **dark theme UI**, and **multiple deployment options**.

[![Astro](https://img.shields.io/badge/Astro-5.16-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Turso](https://img.shields.io/badge/Database-Turso-4F46E5)](https://turso.tech)

**Self-hosted** | **Read-only** | **Git-synced** | **Edge-compatible**

---

## ✨ Features

### Core Features

- 🔐 **Secure Authentication** - Single-user login dengan bcrypt hashing
- 🎨 **Modern Dark UI** - Tailwind CSS v4 dengan glassmorphism effects
- ⚡ **SPA Experience** - Astro View Transitions untuk fluid navigation
- 📂 **File Tree Navigation** - Collapsible folders, intuitive browsing
- 🔍 **Fast Search** - Client-side full-text search via FlexSearch
- 🔄 **Git Sync** - One-click sync dari private/public repositories

### Content Rendering

- 📝 **Markdown** - GitHub Flavored Markdown support
- 🔗 **Wikilinks** - `[[note]]` dan `[[note|alias]]` support
- 🎨 **Code Highlighting** - 180+ languages via highlight.js
- 📑 **Table of Contents** - Auto-generated ToC untuk long articles
- 📊 **Mermaid Diagrams** - Render flowcharts, sequences, etc.
- ✏️ **Excalidraw** - Embed viewer support

### Deployment Options

- 🌐 **Passenger** - Deploy ke shared hosting (cPanel)
- 🐳 **Docker** - Containerized deployment untuk VPS
- 🔧 **PM2** - Process manager untuk bare metal servers
- ☁️ **Edge-ready** - Compatible dengan Vercel, Railway, Fly.io

---

## 🚀 Quick Start

### Option 1: Development (Local)

```bash
# 1. Clone repository
git clone https://github.com/kaqfa/astro-obsidian.git
cd astro-obsidian

# 2. Install dependencies
npm install

# 3. Setup database
npx tsx migrate.ts
npx tsx setup.ts  # Create user

# 4. Clone your vault
git clone <your-vault-url> vault

# 5. Configure environment
cp .env.example .env
nano .env  # Edit GIT_REPO_URL

# 6. Start dev server
npm run dev
# Open http://localhost:4321
```

### Option 2: Production (Choose Your Platform)

#### 🌐 Shared Hosting (Passenger/cPanel)

```bash
# Clone pre-built deployment package
git clone https://gitlab.com/kaqfa/mp-fahri.git
cd mp-fahri

# Setup via cPanel Node.js App
# Startup file: app.mjs
# See: docs/deployment/PASSENGER_GUIDE.md
```

#### 🐳 VPS (Docker)

```bash
# Clone source
git clone https://github.com/kaqfa/astro-obsidian.git
cd astro-obsidian

# Setup environment
cp .env.example .env
nano .env

# Start with Docker Compose
docker-compose up -d

# Initialize database
docker exec -it obsidian-web npx tsx migrate.ts
docker exec -it obsidian-web npx tsx setup.ts
```

#### 🔧 VPS (PM2)

```bash
# Build and deploy
npm run build
pm2 start ecosystem.config.js

# See: docs/deployment/PM2_GUIDE.md
```

---

## 📋 Requirements

### Server Requirements

- **Node.js** 18+ (20+ recommended)
- **Git** client installed
- **Database**: Turso Cloud (production) or local SQLite (development)

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```bash
# Database (choose one)
TURSO_DATABASE_URL=file:local.db           # Local SQLite
# TURSO_DATABASE_URL=libsql://....turso.io  # Turso Cloud
TURSO_AUTH_TOKEN=                          # For Turso Cloud only

# Vault Repository
GIT_REPO_URL=https://github.com/user/vault.git

# For Private Repositories
GIT_USERNAME=your-username
GIT_TOKEN=your-personal-access-token

# Environment
NODE_ENV=production
```

### Database Setup

**Local SQLite (Development):**

```bash
npx tsx migrate.ts
npx tsx setup.ts
```

**Turso Cloud (Production):**
See [docs/deployment/TURSO_SETUP.md](docs/deployment/TURSO_SETUP.md)

---

## 📚 Documentation

Comprehensive guides available in [docs/](docs/):

### 🏗️ Architecture & Design

- [Software Vision](docs/architecture/SOFTWARE_VISION.md) - Product overview & roadmap
- [Software Requirements](docs/architecture/SOFTWARE_REQUIREMENTS.md) - Technical specifications

### 🚀 Deployment Guides

- [Passenger (cPanel)](docs/deployment/PASSENGER_GUIDE.md) - Shared hosting deployment
- [Docker (VPS)](docs/deployment/DOCKER_GUIDE.md) - Containerized deployment
- [PM2 (VPS)](docs/deployment/PM2_GUIDE.md) - Process manager setup
- [Turso Database](docs/deployment/TURSO_SETUP.md) - Database configuration
- [Local Testing](docs/deployment/PASSENGER_LOCAL_TESTING.md) - Test before deploy

**📖 [View All Documentation](docs/README.md)**

---

## 🛠️ Tech Stack

| Layer                | Technology              | Purpose                    |
| -------------------- | ----------------------- | -------------------------- |
| **Framework**        | Astro 5.x               | SSR + Islands Architecture |
| **UI Library**       | React 18                | Interactive components     |
| **Styling**          | Tailwind CSS v4         | Modern dark theme          |
| **Database**         | Turso/LibSQL            | Edge-compatible SQLite     |
| **ORM**              | Drizzle                 | Type-safe queries          |
| **Auth**             | Lucia v3                | Session management         |
| **Search**           | FlexSearch              | Client-side indexing       |
| **Markdown**         | unified + remark/rehype | Content processing         |
| **Syntax Highlight** | highlight.js            | Code blocks                |
| **Diagrams**         | Mermaid.js              | Visualization              |
| **Git**              | simple-git              | Repository sync            |

---

## 🎯 Use Cases

### Personal Knowledge Base

- Access your Obsidian vault from anywhere
- Share specific notes via URL
- No need for Obsidian app on every device

### Team Documentation

- Read-only access untuk team members
- Central knowledge repository
- Git-backed version control

### Research Notes

- Publish research notes online
- Searchable knowledge base
- Mermaid diagrams untuk visualizations

### Developer Documentation

- Code-highlighted technical docs
- Table of Contents untuk long articles
- Wikilinks untuk cross-references

---

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrated (`npx tsx migrate.ts`)
- [ ] User created (`npx tsx setup.ts`)
- [ ] Vault cloned or synced
- [ ] Test locally (`node dist/server/entry.mjs`)
- [ ] Choose deployment platform (Passenger/Docker/PM2)
- [ ] Follow platform-specific guide in [docs/deployment/](docs/deployment/)

---

## 🔄 Update Workflow

### Update Application

```bash
# Pull latest code
git pull

# Update dependencies
npm install

# Rebuild
npm run build

# Restart server (deployment-specific)
# Passenger: touch tmp/restart.txt
# Docker: docker-compose restart
# PM2: pm2 reload obsidian-web
```

### Update Vault

Click **Sync** button in app, or:

```bash
cd vault
git pull
```

---

## 🐛 Troubleshooting

### Build Errors

- Check Node.js version: `node -v` (need 18+)
- Clean install: `rm -rf node_modules package-lock.json && npm install`

### Database Errors

- Re-run migration: `npx tsx migrate.ts`
- Check permissions: `ls -la local.db`

### Git Sync Issues

- Verify credentials in `.env`
- Test manual pull: `cd vault && git pull`

### More Help

See [docs/deployment/DEPLOYMENT.md](docs/deployment/DEPLOYMENT.md) for common issues.

---

## 📦 Project Structure

```
obsidian-web/
├── src/
│   ├── components/          # React components
│   ├── layouts/            # Astro layouts
│   ├── lib/                # Core libraries
│   │   ├── auth.ts         # Authentication
│   │   ├── db/             # Database (Drizzle + Turso)
│   │   ├── git.ts          # Git operations
│   │   ├── markdown.ts     # Markdown processing
│   │   └── vault.ts        # Vault management
│   ├── pages/              # Astro pages/routes
│   └── styles/             # Global styles
├── docs/                   # Documentation
│   ├── architecture/       # Design docs
│   └── deployment/         # Deployment guides
├── deploy/                 # Pre-built package (Passenger)
├── vault/                  # Your Obsidian vault (git clone)
├── Dockerfile             # Docker image
├── docker-compose.yml     # Docker orchestration
├── ecosystem.config.js    # PM2 configuration
└── migrate.ts             # Database migration
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License - feel free to use for personal or commercial projects.

---

## 🙏 Acknowledgments

Built with:

- [Astro](https://astro.build) - Modern web framework
- [Lucia](https://lucia-auth.com) - Authentication library
- [Turso](https://turso.tech) - Edge-compatible database
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Mermaid](https://mermaid.js.org) - Diagram rendering
- [FlexSearch](https://github.com/nextapps-de/flexsearch) - Client-side search

---

## 📬 Support

- **Issues**: [GitHub Issues](https://github.com/kaqfa/astro-obsidian/issues)
- **Documentation**: [docs/README.md](docs/README.md)
- **Email**: fahri.firdausillah@example.com

---

<div align="center">

**Made with ❤️ for the Obsidian community**

[Documentation](docs/) • [Report Bug](https://github.com/kaqfa/astro-obsidian/issues) • [Request Feature](https://github.com/kaqfa/astro-obsidian/issues)

</div>
