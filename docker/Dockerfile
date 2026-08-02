# Multi-stage Dockerfile for A² ReVamp Gym Enterprise Platform
FROM node:20-alpine AS base
WORKDIR /app

# Copy monorepo manifests
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy full monorepo source code
COPY . .

# Build Vite frontend assets
RUN npm run build

# Server entry stage
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "apps/api/server.js"]
