# S2 — Deploy en Fly.io + Vercel + Cloudflare SSL

## Objetivo

Desplegar Credia a producción con:
- **Frontend:** Vercel (Next.js)
- **Backend:** Fly.io (NestJS)
- **Dominio + SSL:** Cloudflare

## Responsables

- **Owner:** Sebastián Jara (`SebastianJara21`)
- **Rama:** `feat/infra/deploy-prod`

---

## Arquitectura de producción

```
                    Cloudflare (DNS + SSL)
                           │
            ┌──────────────┴──────────────┐
            │                             │
      app.credia.io               api.credia.io
            │                             │
            ▼                             ▼
      Vercel (CDN)                 Fly.io (VMs)
      Next.js 16                   NestJS 11
      (serverless)                 (Docker)
            │                             │
            └──────────────┬──────────────┘
                           │
                      Cloudflare Proxy
                      (SSL termination)
                           │
                           ▼
                    Nginx en docker-compose.prod.yml
                    (opcional, puede usarse solo Vercel + Fly)
```

---

## Paso 1 — Preparar build para producción

Antes de deployar, confirmar que todo compila:

```bash
# API
cd packages/api && pnpm build

# Web
cd apps/web && pnpm build
```

### Archivos críticos ya generados por S1

- `infra/docker/api.Dockerfile` — imagen multi-stage
- `infra/docker/web.Dockerfile` — imagen multi-stage
- `infra/.env.production.example` — template de variables

---

## Paso 2 — Deploy Backend: Fly.io

### Prerrequisitos

```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

### 2.1 — Crear app en Fly

```bash
cd packages/api
fly launch --image nginx:alpine --name credia-api --regions quito
```

> El nombre de la app debe ser `credia-api` para que el DNS de Cloudflare apunte correctamente.

### 2.2 — Configurar secrets

```bash
# Variables de producción
fly secrets set NODE_ENV=production
fly secrets set PORT=3001
fly secrets set DATABASE_URL=postgresql://credia:YOUR_PASS@your-db.fly.dev:5432/credia_db
fly secrets set REDIS_URL=redis://:YOUR_REDIS_PASS@redis.internal:6379
fly secrets set JWT_SECRET=YOUR_JWT_SECRET
fly secrets set JWT_EXPIRATION=7d
fly secrets set JWT_REFRESH_SECRET=YOUR_REFRESH_SECRET
fly secrets set JWT_REFRESH_EXPIRATION=30d
fly secrets set SOLANA_NETWORK=devnet
fly secrets set SOLANA_RPC_URL=https://api.devnet.solana.com
fly secrets set SOLANA_PROGRAM_ID=DUS67qe9NMfLuYr99X21a7NQ12sRHZCpTCDpyGzs4T5o

# Admin wallet (cuidado con esto — nunca en repo)
fly secrets set ADMIN_WALLET_PRIVATE_KEY=your-base64-encoded-key

# MinIO
fly secrets set STORAGE_ENDPOINT=http://minio:9000
fly secrets set STORAGE_ACCESS_KEY=your-minio-key
fly secrets set STORAGE_SECRET_KEY=your-minio-secret
fly secrets set STORAGE_BUCKET=credia-docs
```

### 2.3 — Dockerfile para Fly

Crear `packages/api/Dockerfile` (separa del de docker-compose):

```dockerfile
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma/ ./prisma/
RUN pnpm --filter @credia/api prisma generate

COPY . .
RUN pnpm --filter @credia/api build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### 2.4 — Configuración de Fly

Crear `packages/api/fly.toml`:

```toml
app = "credia-api"
primary_region = "qut"
kill_signal = "SIGINT"
kill_timeout = "5s"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3001"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_exit = "graceful"
  auto_start = true
  min_machines_running = 1
  processes = ["app"]

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

### 2.5 — Deploy

```bash
fly deploy
fly ips list
```

Tomar nota de la IP asignada para configurar Cloudflare después.

---

## Paso 3 — Deploy Frontend: Vercel

### 3.1 — Conectar repo a Vercel

```bash
npm i -g vercel
cd apps/web
vercel login
vercel --prod
```

O via UI:
1. Ir a https://vercel.com
2. Importar repo `yanditv/credia`
3. Carpeta raíz: `apps/web`
4. Framework: Next.js
5. Variables de entorno: `NEXT_PUBLIC_API_URL=https://api.credia.io`

### 3.2 — Variables de entorno en Vercel

```
NEXT_PUBLIC_API_URL=https://api.credia.io
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_PROGRAM_ID=DUS67qe9NMfLuYr99X21a7NQ12sRHZCpTCDpyGzs4T5o
```

### 3.3 — Dominios personalizados

En Vercel Dashboard:
1. Settings → Domains
2. Agregar `app.credia.io`
3. Vercel provee verificación CNAME

---

## Paso 4 — Cloudflare (DNS + SSL)

### 4.1 — Dominios

| Dominio | Tipo | Valor | Proxy |
|---|---|---|---|
| `app.credia.io` | CNAME | `cname.vercel-dns.com` | DNS Only |
| `api.credia.io` | A | `<fly-ip>` | Proxy (Flexible SSL) |
| `credia.io` | A | `<fly-ip>` | Proxy |
| `www.credia.io` | CNAME | `credia.io` | Proxy |

### 4.2 — Configuración SSL

En Cloudflare Dashboard → SSL/TLS:
- Mode: **Full** (encrypts traffic end-to-end)
- Minimum TLS version: 1.2

### 4.3 — Page Rules (opcional)

```
https://credia.io/* → Always use HTTPS
```

---

## Paso 5 — Verificación post-deploy

### Smoke tests

```bash
# API health
curl https://api.credia.io/api/health

# Swagger
curl https://api.credia.io/api/docs

# Web
curl https://app.credia.io

# Auth flow
curl -X POST https://api.credia.io/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@credia.io","password":"demo1234"}'
```

### Checklist final

- [ ] `https://app.credia.io` responde con Next.js app
- [ ] `https://api.credia.io/api/docs` muestra Swagger
- [ ] Login funciona (POST `/auth/login`)
- [ ] SSL válido en ambos dominios (Lock icon en navegador)
- [ ] Wallet connection de Solana funciona en el browser
- [ ] Imagen de logo carga correctamente

---

## Estructura final de archivos

```
credia/
├── packages/
│   └── api/
│       ├── Dockerfile              # Fly.io
│       ├── fly.toml                # Fly config
│       └── .env.production         # Secrets (NO commitear)
├── apps/
│   └── web/
│       └── .env.production.local   # Vercel secrets (NO commitear)
└── infra/
    ├── S1_INTEGRATION_PLAN.md
    ├── S2_INTEGRATION_PLAN.md       # Este archivo
    ├── docker/
    │   ├── api.Dockerfile
    │   ├── web.Dockerfile
    │   └── prod.conf
    └── docker-compose.prod.yml
```

---

## Commits a realizar

```
chore(deploy): agrega Dockerfile para Fly.io
chore(deploy): agrega fly.toml con config de region Quito
chore(deploy): agrega script deploy.sh para automatización
chore(deploy): configura Vercel para frontend Next.js
chore(deploy): configura dominio app.credia.io en Vercel
chore(deploy): configura DNS en Cloudflare para ambos subdominios
chore(docs): actualiza README con URLs de producción
```

---

## Notas de adaptabilidad

1. **Si Fly.io no funciona** — alternative: Railway, Render, o VPS con Docker
2. **Si se necesita más poder** — escalar VMs en Fly: `fly scale vm 2gb`
3. **Si mainnet Solana** — cambiar `SOLANA_NETWORK` a `mainnet-beta` y actualizar RPC URL
4. **Si se usa postgres de Fly** — cambiar `DATABASE_URL` al connection string de Fly pg
5. **Si se necesita más regiones** — agregar en `fly.toml` bajo `[regions]` y redesplegar

---

## Rollback plan

Si algo falla en producción:

```bash
# Rollback a versión anterior
fly releases -a credia-api
fly deploy --image <previous-image>

# Si todo falla, volver a localhost
# Cambiar NEXT_PUBLIC_API_URL en Vercel a http://localhost:3001
```

---

## Referencias

- [SPRINT_PLAN.md — Bloque 5 Día 3](SPRINT_PLAN.md#bloque-5-2h--deploy)
- [CLAUDE.md — Stack tecnológico](../CLAUDE.md#-stack-tecnológico)
- [S1_INTEGRATION_PLAN.md](./S1_INTEGRATION_PLAN.md) — Dockerfiles
- [Fly.io Docs](https://fly.io/docs/)
- [Vercel Docs](https://vercel.com/docs)
- [Cloudflare Docs](https://developers.cloudflare.com/)