# Deploy de Credia — runbook

Arquitectura objetivo:

```
                      Cloudflare DNS
                            │
              ┌─────────────┴──────────────┐
              ▼                            ▼
       app.credia.io                 api.credia.io
              │                            │
              ▼                            ▼
        Vercel (Next.js)            Coolify VPS
                                   ┌────┴─────┐
                                   ▼          ▼
                              api(NestJS) postgres redis minio
                              (docker-compose.prod.yml)
```

| Componente | Plataforma | Detalle |
|---|---|---|
| Frontend (Next.js 16) | **Vercel** | `apps/web` — auto-deploy en push a `develop`/`main` |
| API (NestJS 11) | **Coolify** | `packages/api/Dockerfile` orquestado por `docker-compose.prod.yml` |
| Postgres 16, Redis 7, MinIO | **Coolify** (mismo VPS) | servicios stateful en la misma stack |
| Smart contract Solana | **devnet** | `DUS67qe9NMfLuYr99X21a7NQ12sRHZCpTCDpyGzs4T5o` (pre-deployado) |

## Orden de setup (primera vez)

1. **Backend en Coolify** → ver `infra/coolify/README.md`
   - Anotá la URL pública (ej. `https://api.credia.io`).
2. **Frontend en Vercel** → ver `infra/vercel/README.md`
   - Configurá `NEXT_PUBLIC_API_URL` con la URL del paso 1.
   - Anotá la URL de Vercel (ej. `https://app.credia.io`).
3. **Volvé a Coolify** y actualizá `CORS_ORIGIN` con la URL de Vercel. Redeploy del backend.
4. **Verificación E2E**:
   - `curl https://api.credia.io/docs` → HTML de Swagger.
   - Browser: login con `demo@credia.io / demo1234` en la URL de Vercel → cae en `/mi-perfil`.

## Deploy continuo

A partir del primer setup, el flujo es:

```
git push origin develop
        │
        ├─► Vercel build & deploy (~1 min)
        └─► Coolify polling (~30 s) → rebuild stack si hay cambios en packages/api/**
```

PRs abren preview deploys en Vercel automáticamente. Coolify solo deploya develop/main.

## Variables de entorno — quién recibe qué

| Variable | Coolify (API) | Vercel (Web) |
|---|:-:|:-:|
| `DATABASE_URL` (computado) | ✅ | — |
| `REDIS_URL` (computado) | ✅ | — |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | ✅ | — |
| `ADMIN_KEYPAIR` (secret) | ✅ | — |
| `SOLANA_*` | ✅ | — |
| `MINIO_*`, `STORAGE_*` | ✅ | — |
| `CORS_ORIGIN` | ✅ | — |
| `NEXT_PUBLIC_API_URL` | — | ✅ |
| `NEXT_PUBLIC_SOLANA_NETWORK` | — | ✅ |

## Healthchecks

- **API:** `GET /docs` (Swagger UI) — usado por el healthcheck del compose y por Coolify.
- **Postgres:** `pg_isready` interno.
- **Redis:** `redis-cli ping` interno.
- **MinIO:** `/minio/health/live` interno.
- **Frontend:** Vercel monitorea `/` automáticamente.

## Rollback

| Capa | Cómo |
|---|---|
| Frontend | Vercel UI → **Deployments → ‹anterior› → Promote to Production** |
| Backend | Coolify UI → **Deployments → ‹commit anterior› → Redeploy** |
| Schema (DB) | Las migraciones Prisma son aditivas. Para rollback: nueva migración con el cambio inverso. **No** ejecutar `prisma migrate reset` en producción (borra datos). |

## Próximos pasos opcionales

- [ ] Backups automáticos de Postgres en Coolify (UI → Service → Backups).
- [ ] Sentry o similar para error tracking en frontend y backend.
- [ ] Endpoint dedicado `/health` (más liviano que `/docs`).
- [ ] Workers BullMQ separados (hoy corren in-process en `api`).
- [ ] Migrar Solana program a mainnet (cambiar `SOLANA_NETWORK=mainnet` en Coolify y `NEXT_PUBLIC_SOLANA_NETWORK=mainnet` en Vercel; redeploy del Anchor program).
