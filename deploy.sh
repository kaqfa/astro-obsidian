#!/bin/bash
# Build dan commit ke deployment branch

echo "🚀 Building for production..."
npm run build

echo "📦 Preparing deployment package..."
rm -rf deploy
mkdir -p deploy

# Copy files
cp -r dist deploy/
cp -r src deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp astro.config.mjs deploy/
cp tsconfig.json deploy/
cp migrate.ts deploy/
cp setup.ts deploy/
cp .env.example deploy/

# Create .gitignore for deploy folder
cat > deploy/.gitignore << EOF
node_modules/
.env
vault/
local.db
*.log
EOF

# Create README for deployment
cat > deploy/README.md << EOF
# Obsidian Web - Production Build

This is a pre-built production package.

## Setup

1. Clone this repo to your hosting:
   \`\`\`bash
   git clone https://github.com/kaqfa/astro-obsidian-deploy.git
   cd astro-obsidian-deploy
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install --production
   \`\`\`

3. Setup environment:
   \`\`\`bash
   cp .env.example .env
   nano .env  # Edit with your credentials
   \`\`\`

4. Initialize database:
   \`\`\`bash
   npx tsx migrate.ts
   npx tsx setup.ts
   \`\`\`

5. Clone vault:
   \`\`\`bash
   git clone <your-vault-url> vault
   \`\`\`

6. Start server:
   \`\`\`bash
   node dist/server/entry.mjs
   \`\`\`

## Update

\`\`\`bash
git pull
npm install --production
# Restart server
\`\`\`
EOF

echo "✅ Deployment package ready in ./deploy/"
echo ""
echo "Setting up for local testing..."

# Create symlink to vault (if exists)
if [ -d "./vault" ]; then
  cd deploy
  ln -sf ../vault vault
  echo "✅ Vault symlink created"
  cd ..
fi

# Copy .env if exists
if [ -f ".env" ]; then
  cp .env deploy/.env
  echo "✅ Environment variables copied"
fi

echo ""
echo "To test locally:"
echo "  cd deploy"
echo "  npx tsx migrate.ts  # First time only"
echo "  node dist/server/entry.mjs"
echo "  # Or test with Passenger: passenger start"
echo ""
echo "To deploy to server:"
echo "1. cd deploy"
echo "2. git add ."
echo "3. git commit -m 'production build'"
echo "4. git push"
