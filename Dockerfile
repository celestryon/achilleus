FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

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

CMD ["pnpm", "start"]