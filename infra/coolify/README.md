# Deploy del backend en Coolify (single-VPS)

Este runbook deja la API + Postgres + Redis + MinIO corriendo en un VPS gestionado por [Coolify](https://coolify.io/), con auto-deploy por polling del repo.

## Prerequisitos

- VPS con Coolify v4+ instalado y dominio apuntando a la IP del VPS.
- Subdominio para la API resuelto en Cloudflare/DNS, p.ej. `api.credia.io`.
- Repo `credia` accesible (público o GitHub App de Coolify configurada).
- Wallet admin de Solana (ver `ADMIN_KEYPAIR` abajo).

## Arquitectura

```
            Cloudflare DNS (proxy ON)
                     │
                     ▼
              api.credia.io
                     │
                     ▼
            Coolify ingress (Traefik)
                     │
   ┌─────────────────┴─────────────────┐
   ▼                                   ▼
[ api ]   ←  red interna  →   [ postgres / redis / minio ]
docker-compose.prod.yml expuesto solo el container `api` al ingress.
```

## Setup paso a paso

### 1. Crear proyecto y resource en Coolify

1. **New Project** → name `credia`.
2. Dentro del proyecto: **New Resource** → **Docker Compose Empty**.
3. **Source** → Public Repository (o GitHub App si querés private):
   - Repository URL: `https://github.com/yanditv/credia`
   - Branch: `develop` (o `main` cuando esté listo)
   - Base Directory: `/` (raíz)
   - Docker Compose File: `docker-compose.prod.yml`

### 2. Variables de entorno

En **Resource → Environment Variables**, pegá el contenido de `.env.production.example` y reemplazá los `CHANGE_ME_*` con valores reales:

- `POSTGRES_PASSWORD` — password fuerte (Coolify puede generarte uno con el botón 🎲).
- `MINIO_ROOT_PASSWORD` — idem.
- `JWT_SECRET` y `JWT_REFRESH_SECRET` — distintos entre sí, ≥32 chars cada uno.
- `ADMIN_KEYPAIR` — JSON array de 64 numbers (`solana-keygen new --outfile admin.json && cat admin.json`).
- `CORS_ORIGIN` — URL del frontend en Vercel (ver `infra/vercel/README.md`).
- `STORAGE_PUBLIC_URL` — `https://storage.credia.io` (el dominio del paso 3.b). Si no lo seteás, los comprobantes suben pero las URLs rompen.

> **Tip:** Coolify soporta secrets vs variables. Marcá los `*_SECRET`, `*_PASSWORD` y `ADMIN_KEYPAIR` como secret para que se enmascaren en logs/UI.

### 3. Exponer servicios por dominio

En **Resource → Domains**, agregá dos entradas (Coolify provee SSL Let's Encrypt automático en ambas):

#### 3.a — API (siempre pública)

- **Service:** `api`
- **Port:** `3001`
- **Domain:** `api.credia.io`

#### 3.b — MinIO API (necesaria para servir comprobantes)

- **Service:** `minio`
- **Port:** `9000`
- **Domain:** `storage.credia.io`

> **Por qué necesitás este dominio:** la API guarda objetos en MinIO usando el endpoint interno `http://minio:9000`, pero la URL que devuelve al frontend tiene que ser **pública** para que el navegador del usuario pueda abrir el comprobante. La env `STORAGE_PUBLIC_URL=https://storage.credia.io` es lo que se serializa en `evidenceUrl`. Si no exponés este dominio, los archivos suben pero los links rompen.

#### Consola admin de MinIO (puerto 9001)

**No** la expongas públicamente — tiene credenciales de root. Para acceso ocasional, túnel ssh desde tu máquina:

```bash
ssh -L 9001:credia-minio:9001 user@vps
# luego abrí http://localhost:9001 en el browser local
```

> Postgres / Redis quedan totalmente internos al stack docker. Sin dominio, sin port mapping al host.

### 4. Auto-deploy

En **Resource → General → Automatic Deployment**:

- ✅ Watch this branch: `develop`
- ✅ Auto deploy on git push (Coolify hace polling cada ~30s).

A partir de acá, cada push a `develop` rebuildea el stack.

### 5. Primer deploy

1. Click **Deploy**. La build del Dockerfile multi-stage tarda 2-4 min.
2. Verificá `Logs` del servicio `api` que vea:
   - `Prisma migrate deploy` apply exitoso (incluso 0 migrations en una DB nueva, tiene que crear `_prisma_migrations`).
   - `Nest application successfully started` y `Listening on port 3001`.
3. Probá: `curl https://api.credia.io/docs` → debería devolver el HTML de Swagger.

### 6. Seed inicial (opcional, una sola vez)

Para cargar el usuario demo (`demo@credia.io / demo1234` con score precalculado):

```bash
# Desde el host del VPS:
docker exec -it $(docker ps --filter "label=coolify.applicationId" --filter "name=api" -q) \
  npx prisma db seed --schema packages/api/prisma/schema.prisma
```

## Healthcheck y rollback

- `docker-compose.prod.yml` tiene healthcheck en el servicio `api` apuntando a `/docs`. Si la API queda down, Coolify la reinicia.
- Para rollback rápido en Coolify: **Deployments → ‹commit anterior› → Redeploy**.

## Troubleshooting frecuente

| Síntoma | Causa probable | Fix |
|---|---|---|
| `npm ci` falla en build | `package-lock.json` desincronizado | `npm install` local + commit |
| `prisma migrate deploy` cuelga | DB unreachable | Revisar healthcheck de `postgres`, `depends_on` ya cubre |
| `Cuenta no activa o suspendida` al login | `POSTGRES_PASSWORD` cambió, sesiones JWT viejas | Logout + nuevo login |
| Frontend dispara CORS en producción | `CORS_ORIGIN` no matchea Vercel URL exacta | Actualizar env y redeployar (no requiere rebuild de imagen) |
| MinIO bucket no existe | UploadService crea el bucket en `onModuleInit` | Reinicia el container `api` después de que MinIO esté healthy |

## Variables que NUNCA van al frontend

Ninguna de estas debe terminar en Vercel:

- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `ADMIN_KEYPAIR`
- `POSTGRES_PASSWORD`, `MINIO_ROOT_PASSWORD`
- Credenciales de DB

Para variables públicas del frontend (ej. URL de la API) ver `infra/vercel/README.md`.
