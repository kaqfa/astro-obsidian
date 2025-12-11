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

echo "✅ Deployment package ready!"
echo ""
echo "Next steps:"
echo "1. cd deploy"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'production build'"
echo "5. git remote add origin https://github.com/kaqfa/astro-obsidian-deploy.git"
echo "6. git push -u origin main"
