# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/astro.config.mjs ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/migrate.ts ./
COPY --from=builder /app/setup.ts ./

# Create directories
RUN mkdir -p vault logs

# Expose port
EXPOSE 4321

# Start app
CMD ["node", "dist/server/entry.mjs"]
