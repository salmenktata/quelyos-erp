# Multi-stage build for Next.js production (pnpm monorepo)
# Build context: root of monorepo

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all package.json files for workspace resolution
COPY packages/ ./packages/
COPY vitrine-quelyos/package.json ./vitrine-quelyos/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/vitrine-quelyos/node_modules ./vitrine-quelyos/node_modules

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY vitrine-quelyos/ ./vitrine-quelyos/

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

WORKDIR /app/vitrine-quelyos
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/vitrine-quelyos/public ./public
COPY --from=builder /app/vitrine-quelyos/.next/standalone ./
COPY --from=builder /app/vitrine-quelyos/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
