# ---- Base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ---- Builder ----
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma/ ./prisma/
RUN pnpm --filter @credia/api prisma generate
COPY . .
RUN pnpm --filter @credia/api build

# ---- Prod deps ----
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---- Runner ----
FROM node:22-alpine AS runner
RUN addgroup -S credia && adduser -S credia -G credia
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json ./package.json
COPY prisma/ ./prisma/
USER credia
EXPOSE 3001
CMD ["node", "dist/main.js"]