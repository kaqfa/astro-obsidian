#!/bin/bash
# Deploy script untuk shared hosting

echo "🚀 Building for production..."
npm run build

echo "📦 Preparing deployment package..."
mkdir -p ./deploy
cp -r dist ./deploy/
cp package.json ./deploy/
cp -r src ./deploy/
cp astro.config.mjs ./deploy/
cp tsconfig.json ./deploy/
cp migrate.ts ./deploy/
cp setup.ts ./deploy/
cp .env.example ./deploy/

echo "✅ Deployment package ready in ./deploy/"
echo ""
echo "Next steps:"
echo "1. Upload ./deploy/ folder ke hosting Anda"
echo "2. SSH ke hosting, cd ke folder deploy"
echo "3. Run: npm install --production"
echo "4. Copy .env.example ke .env dan isi credentials"
echo "5. Run: npx tsx migrate.ts"
echo "6. Run: npx tsx setup.ts"
echo "7. Start: node dist/server/entry.mjs (atau via cPanel Node.js App)"
