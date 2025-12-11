# 📚 Documentation Index

Comprehensive documentation for Obsidian Web Viewer v2.0

---

## 📖 Quick Links

- **Getting Started**: See main [README.md](../README.md)
- **Architecture**: [Software Vision](./architecture/SOFTWARE_VISION.md) | [Requirements](./architecture/SOFTWARE_REQUIREMENTS.md)
- **Deployment**: Choose your platform below
- **Development**: Local testing and debugging guides

---

## 🏗️ Architecture & Design

High-level design documents and specifications.

| Document                                                            | Description                                       |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| [SOFTWARE_VISION.md](./architecture/SOFTWARE_VISION.md)             | Product vision, features, tech stack, and roadmap |
| [SOFTWARE_REQUIREMENTS.md](./architecture/SOFTWARE_REQUIREMENTS.md) | Functional & non-functional requirements (SRS)    |

---

## 🚀 Deployment Guides

Choose your deployment platform:

### Production Deployment

| Platform               | Guide                                                 | Best For       | Difficulty  |
| ---------------------- | ----------------------------------------------------- | -------------- | ----------- |
| **Passenger (cPanel)** | [PASSENGER_GUIDE.md](./deployment/PASSENGER_GUIDE.md) | Shared hosting | ⭐ Easy     |
| **Docker (VPS)**       | [DOCKER_GUIDE.md](./deployment/DOCKER_GUIDE.md)       | VPS/Cloud      | ⭐⭐ Medium |
| **PM2 (VPS)**          | [PM2_GUIDE.md](./deployment/PM2_GUIDE.md)             | VPS bare metal | ⭐⭐ Medium |

### Supporting Documentation

| Document                                                              | Description                                     |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| [DEPLOYMENT.md](./deployment/DEPLOYMENT.md)                           | General deployment overview & troubleshooting   |
| [TURSO_SETUP.md](./deployment/TURSO_SETUP.md)                         | Database setup (local SQLite or Turso Cloud)    |
| [PASSENGER_LOCAL_TESTING.md](./deployment/PASSENGER_LOCAL_TESTING.md) | Test Passenger locally before production deploy |

---

## 🛠️ Development

Coming soon:

- Local development setup
- Contributing guidelines
- Testing guide
- Code style guide

---

## 📋 Quick Start by Use Case

### "I have shared hosting (cPanel)"

1. Read: [PASSENGER_GUIDE.md](./deployment/PASSENGER_GUIDE.md)
2. Optional: [Test locally first](./deployment/PASSENGER_LOCAL_TESTING.md)
3. Setup: [TURSO_SETUP.md](./deployment/TURSO_SETUP.md) (optional, use local SQLite)

### "I have a VPS"

**Option A - Docker (Recommended):**

1. Read: [DOCKER_GUIDE.md](./deployment/DOCKER_GUIDE.md)
2. Setup: [TURSO_SETUP.md](./deployment/TURSO_SETUP.md)

**Option B - PM2:**

1. Read: [PM2_GUIDE.md](./deployment/PM2_GUIDE.md)
2. Setup: [TURSO_SETUP.md](./deployment/TURSO_SETUP.md)

### "I want to understand the architecture"

1. Read: [SOFTWARE_VISION.md](./architecture/SOFTWARE_VISION.md)
2. Deep dive: [SOFTWARE_REQUIREMENTS.md](./architecture/SOFTWARE_REQUIREMENTS.md)

### "I want to test before deploying"

1. Read: [PASSENGER_LOCAL_TESTING.md](./deployment/PASSENGER_LOCAL_TESTING.md)
2. Test: `npm run build && cd deploy && passenger start`

---

## 📁 Documentation Structure

```
docs/
├── README.md                          # This file
├── architecture/                      # Design & specifications
│   ├── SOFTWARE_VISION.md            # Product vision v2.0
│   └── SOFTWARE_REQUIREMENTS.md      # SRS document
└── deployment/                        # Deployment guides
    ├── DEPLOYMENT.md                  # General deployment info
    ├── DOCKER_GUIDE.md               # Docker/VPS deployment
    ├── PASSENGER_GUIDE.md            # Passenger/cPanel deployment
    ├── PASSENGER_LOCAL_TESTING.md    # Local Passenger testing
    ├── PM2_GUIDE.md                  # PM2 process manager
    └── TURSO_SETUP.md                # Database setup
```

---

## 🔄 Document Updates

All documents reflect **v2.0** features:

- ✅ SPA experience (Astro View Transitions)
- ✅ Modern dark UI (Tailwind v4)
- ✅ Code syntax highlighting
- ✅ Table of Contents
- ✅ Turso/LibSQL database
- ✅ Multiple deployment options

Last updated: December 2024

---

## 📝 Contributing to Docs

Found a typo or want to improve documentation?

1. Edit the relevant file
2. Submit a pull request
3. Or open an issue with suggestions

---

## 💡 Need Help?

- **Setup Issues**: Check deployment guide for your platform
- **Database Issues**: See [TURSO_SETUP.md](./deployment/TURSO_SETUP.md)
- **Architecture Questions**: Read [SOFTWARE_VISION.md](./architecture/SOFTWARE_VISION.md)
- **Local Testing**: Follow [PASSENGER_LOCAL_TESTING.md](./deployment/PASSENGER_LOCAL_TESTING.md)
