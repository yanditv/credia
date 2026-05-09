# S1 — Dockerfiles Multi-Stage + docker-compose.prod.yml

## Objetivo

Generar la infraestructura de contenedores para producción del proyecto Credia.

## Responsables

- **Owner:** Sebastián Jara (`SebastianJara21`)
- **Rama:** `feat/infra/dockerfiles`

---

## Estado Actual del Proyecto

Para cuando se implemente S1, el proyecto tendrá la siguiente estructura (conocida al momento de escribir este plan):

```
credia/
├── apps/
│   └── web/                    # Next.js 16.2 + React 19.2
├── packages/
│   ├── api/                   # NestJS 11 + Prisma 6 + PostgreSQL 16
│   └── blockchain/            # Anchor 0.31 (desplegado en devnet)
├── docker-compose.yml          # ✅ Existe — desarrollo local
└── infra/                     # ❌ No existe aún
```

### Servicios activos al momento de implementar

| Servicio | Tech | Puerto local | Notes |
|---|---|---|---|
| PostgreSQL | 16 | 5432 | Credia DB |
| Redis | 7 | 6379 | Cache + BullMQ |
| MinIO | latest | 9000/9001 | Storage docs |

### Stack已知

- **API:** NestJS 11, Prisma 6, puerto 3001
- **Web:** Next.js 16 (App Router), puerto 3000
- **Blockchain:** Solana devnet, programa `DUS67qe9NMfLuYr99X21a7NQ12sRHZCpTCDpyGzs4T5o`

---

## Archivos a crear

### 1. `infra/docker/api.Dockerfile`

Dockerfile multi-stage para el backend NestJS.

**Stages:**
- `builder`: `node:22-alpine` — install deps, run `prisma generate`, build tsc
- `deps`: copía solo `node_modules` production-ready
- `runner`: `alpine:3.19` — usuario no-root `credia`, trabajo en `/app`

**Variabels de entorno sensibles (NO hardcodear):**
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `SOLANA_RPC_URL`
- `ADMIN_WALLET_PRIVATE_KEY`

**Ports expuestos:** 3001

```dockerfile
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
FROM alpine:3.19 AS runner
RUN addgroup -S credia && adduser -S credia -G credia
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma/ ./prisma/
USER credia
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### 2. `infra/docker/web.Dockerfile`

Dockerfile multi-stage para el frontend Next.js 16.

**Stages:**
- `builder`: `node:22-alpine` + `pnpm` — `next build` con Turbopack
- `runner`: `node:22-alpine` — `next start` (no Alpine porque Next.js binary tiene issues en musl)

**Variabels de entorno sensibles (NO hardcodear):**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOLANA_NETWORK`
- `NEXT_PUBLIC_SOLANA_PROGRAM_ID`

**Ports expuestos:** 3000

```dockerfile
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./package.json

EXPOSE 3000
CMD ["pnpm", "start"]
```

### 3. `infra/docker-compose.prod.yml`

Compose de producción completo.

**Servicios:**
- `api` — backend NestJS (imagen builder desde `infra/docker/api.Dockerfile`)
- `web` — frontend Next.js (imagen builder desde `infra/docker/web.Dockerfile`)
- `postgres` — PostgreSQL 16 (igual que dev pero con volumen prod)
- `redis` — Redis 7 (igual que dev)
- `minio` — MinIO storage (igual que dev)
- `nginx` — reverse proxy (liga api → /api, web → /)

**Notas de producción:**
- No exponer puertos externos directamente (solo nginx en 80/443)
- `restart: always` en todos los servicios
- `healthcheck` en todos los servicios
- networks isoladas (`credia_internal`)
- volúmenes con prefijos `prod_`

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: credia_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api
      - web
    networks:
      - credia_external

  api:
    build:
      context: .
      dockerfile: infra/docker/api.Dockerfile
    container_name: credia_api
    restart: always
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - credia_internal

  web:
    build:
      context: .
      dockerfile: infra/docker/web.Dockerfile
    container_name: credia_web
    restart: always
    env_file:
      - .env.production.web
    depends_on:
      - api
    networks:
      - credia_external
      - credia_internal

  postgres:
    image: postgres:16-alpine
    container_name: credia_postgres_prod
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - prod_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - credia_internal

  redis:
    image: redis:7-alpine
    container_name: credia_redis_prod
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - prod_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - credia_internal

  minio:
    image: minio/minio:latest
    container_name: credia_minio_prod
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - prod_minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - credia_internal

volumes:
  prod_postgres_data:
  prod_redis_data:
  prod_minio_data:

networks:
  credia_external:
    name: credia_external
  credia_internal:
    name: credia_internal
```

### 4. `infra/nginx/prod.conf`

Configuración de Nginx como reverse proxy.

```nginx
upstream api {
    server api:3001;
}

upstream web {
    server web:3000;
}

server {
    listen 80;
    server_name _;

    # Redirect HTTP to HTTPS (Cloudflare handles SSL)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.credia.io;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name app.credia.io;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    location / {
        proxy_pass http://web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. `infra/.env.production.example`

Template de variables de producción (NO commitear valores reales).

```env
# API
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://credia:CHANGE_IN_PROD@postgres:5432/credia_db
REDIS_URL=redis://:CHANGE_REDIS_PASS@redis:6379
JWT_SECRET=CHANGE_IN_PROD
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=CHANGE_IN_PROD
JWT_REFRESH_EXPIRATION=30d

# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=DUS67qe9NMfLuYr99X21a7NQ12sRHZCpTCDpyGzs4T5o
ADMIN_WALLET_PRIVATE_KEY=CHANGE_IN_PROD

# Storage
STORAGE_ENDPOINT=http://minio:9000
STORAGE_ACCESS_KEY=CHANGE_IN_PROD
STORAGE_SECRET_KEY=CHANGE_IN_PROD
STORAGE_BUCKET=credia-docs

# Frontend
NEXT_PUBLIC_API_URL=https://api.credia.io
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_PROGRAM_ID=DUS67qe9NMfLuYr99X21a7NQ12sRHZCpTCDpyGzs4T5o

# Postgres
POSTGRES_DB=credia_db
POSTGRES_USER=credia
POSTGRES_PASSWORD=CHANGE_IN_PROD

# Redis
REDIS_PASSWORD=CHANGE_IN_PROD

# MinIO
MINIO_USER=CHANGE_IN_PROD
MINIO_PASSWORD=CHANGE_IN_PROD
```

---

## Commits a realizar

```
chore(infra): agrega Dockerfile multi-stage para NestJS API
chore(infra): agrega Dockerfile multi-stage para Next.js Web
chore(infra): agrega nginx/prod.conf como reverse proxy
chore(infra): agrega docker-compose.prod.yml para producción
chore(infra): agrega .env.production.example con todas las variables
```

---

## Checklist de integración futura

- [ ] Verificar que `packages/api/dist/` se construye correctamente
- [ ] Verificar que `apps/web/.next/` se construye correctamente
- [ ] Confirmar que `docker-compose.prod.yml up --build` levanta todos los servicios
- [ ] Verificar que nginx routing funciona: `app.credia.io` → web, `api.credia.io` → api
- [ ] Confirmar healthchecks de postgres, redis y minio
- [ ] Confirmar que las variables de `.env.production` son cargadas correctamente

---

## Notas de adaptabilidad

1. **Si el puerto del API cambia** (ej: 3002), actualizar `nginx/prod.conf` y `EXPOSE` en `api.Dockerfile`
2. **Si se agrega más servicios** (ej: un worker de BullMQ), agregar al compose y al nginx
3. **Si el nombre del package `@credia/api` cambia**, actualizar el filtro `pnpm --filter` en el Dockerfile
4. **Si el programa Anchor se mueve a mainnet**, actualizar `SOLANA_NETWORK` y `SOLANA_RPC_URL` en `.env.production.example`

---

## Referencias

- [SPRINT_PLAN.md — Bloque 5 Día 3](SPRINT_PLAN.md#bloque-5-2h--deploy)
- [CLAUDE.md — Stack tecnológico](../CLAUDE.md#-stack-tecnológico)
- [docker-compose.yml raíz](../docker-compose.yml) — referencia para ports y healthchecks