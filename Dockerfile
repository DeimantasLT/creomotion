# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Expose port
EXPOSE 3000

# Dev command will be provided by docker-compose
CMD ["npm", "run", "dev"]

# Builder stage for production
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./
RUN npm ci

# Copy prisma and generate
COPY prisma ./prisma/
RUN npx prisma generate

# Copy rest and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Only copy production necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts

# Install only production deps, remove dev deps
RUN npm prune --production

# Create entrypoint
RUN printf '#!/bin/sh\nnpx prisma migrate deploy 2>/dev/null || true\nnode scripts/seed.js 2>/dev/null || true\nexec npm start\n' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
