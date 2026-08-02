# Multi-stage Dockerfile for A² ReVamp Gym Platform
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build Vite frontend assets
RUN npm run build

# Server entry stage
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "server/server.js"]
