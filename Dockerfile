FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 achilleus

COPY --from=builder --chown=achilleus:nodejs /app/dist ./dist
COPY --from=builder --chown=achilleus:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=achilleus:nodejs /app/package.json ./package.json
COPY --from=builder --chown=achilleus:nodejs /app/prisma ./prisma

USER achilleus

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]