# ==========================================
# Stage 1: Build & Prisma Generation
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy root configurations
COPY package*.json ./

# Copy api workspace package.json
COPY apps/api/package*.json ./apps/api/

# Install ALL dependencies (including devDependencies for prisma CLI)
RUN npm ci

# Copy full source
COPY . .

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Copy node_modules and generated Prisma client
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Copy source code
COPY --from=builder /app/apps/api/server.js ./apps/api/
COPY --from=builder /app/apps/api/src ./apps/api/src

# Drop privileges to non-root user
RUN chown -R node:node /app
USER node

EXPOSE 5000

CMD ["node", "apps/api/server.js"]
