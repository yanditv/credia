# Deploy del frontend en Vercel

El frontend (Next.js 16 + React 19.2) se despliega en Vercel apuntando al backend que corre en Coolify (ver `infra/coolify/README.md`).

## Arquitectura

```
Cloudflare DNS
      │
      ├─► credia.vercel.app (o app.credia.io)  → Vercel CDN (Next.js)
      │                                              │
      │                                              ▼ fetch
      └─► api.credia.io                          [ Coolify VPS ]
```

## Setup paso a paso

### 1. Conectar repo a Vercel

1. Vercel UI → **Add New Project** → Import `yanditv/credia`.
2. **Framework Preset:** Next.js (auto-detectado).
3. **Root Directory:** `apps/web` (importante — es un monorepo).
4. **Build Command:** `next build` (default).
5. **Install Command:** `npm install --workspaces=false` (para que NO instale workspaces hermanos como `packages/api`, que tienen tooling pesado innecesario en el frontend).
6. **Output Directory:** `.next` (default).

> Si el deploy falla con errores de workspaces, abrí **Project Settings → General → Root Directory** y confirmá `apps/web`. Vercel respeta ese scope.

### 2. Variables de entorno

En **Project Settings → Environment Variables**, agregá para cada environment (Production / Preview / Development):

| Variable | Valor | Notas |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.credia.io` | URL pública de Coolify. **Sin** trailing slash. |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | Para los explorer links. Cambia a `mainnet` solo cuando el program esté en mainnet. |

> **Sin** secrets acá. Las claves van solo en Coolify (`infra/coolify/README.md`).

### 3. Production domain (opcional)

Si tenés `credia.io` en Cloudflare:

1. Vercel UI → **Domains → Add** → `app.credia.io`.
2. Vercel te pide un CNAME — agregá el registro en Cloudflare con **proxy OFF** (gris, no naranja) para que Vercel termine el SSL.
3. Confirmá que `app.credia.io` resuelve a Vercel.
4. Volvé al **Coolify** y actualizá `CORS_ORIGIN=https://app.credia.io` para que el backend acepte requests del frontend.

### 4. CORS — sincronizar con Coolify

El backend rechaza requests de orígenes no listados en `CORS_ORIGIN`. Cada vez que cambies la URL del frontend (preview deploys de Vercel generan URLs únicas), tenés tres opciones:

1. **Producción única (recomendado para hackathon):** `CORS_ORIGIN=https://app.credia.io` — solo la prod URL.
2. **Múltiples orígenes:** si querés permitir previews `*.vercel.app`, ampliar la lógica de CORS en el API para soportar wildcard.
3. **Permisivo en dev:** usar `CORS_ORIGIN=*` solo en staging.

### 5. Deploy

Push a `develop` → Vercel buildea automáticamente. Branch `main` → producción. PRs → preview deploys con URL única.

## Verificación post-deploy

1. Abrir la URL de Vercel.
2. `/login` debería renderizar.
3. Login con el usuario seedeado (`demo@credia.io / demo1234`) → cae en `/mi-perfil` (PR #49 — login role-aware).
4. Sidebar muestra "Mi perfil / Mis ventas / Mi score / Solicitar crédito / Mis créditos".
5. Click en "Mi score" → debería renderizar el ScoreGauge + ScoreBreakdown + OnchainReputationCard (J5).

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| Build falla con `Cannot find module 'packages/api/...'` | Vercel está intentando buildear el monorepo entero | Confirmar Root Directory = `apps/web`, Install command con `--workspaces=false` |
| Login OK pero `/mi-perfil` rebota a `/login` | Cookie `credia_auth_token` no se setea en producción cross-domain | Confirmar que ambos dominios están bajo el mismo apex con `SameSite=Lax`, o aceptar que cada navegación inicial pasa por `/login` |
| CORS error en consola | `CORS_ORIGIN` en Coolify no matchea | Update Coolify env + redeploy |
| Solana explorer abre tx en mainnet | `NEXT_PUBLIC_SOLANA_NETWORK` desactualizado | Update env + redeploy |

## Notas

- No necesitamos `vercel.json` para el shape estándar de Next.js. Si en algún momento querés rewrites o headers custom, agregar `apps/web/vercel.json`.
- El React Compiler estable de Next.js 16 viene activo por config (`next.config.ts`); Vercel lo soporta nativamente.
- Turbopack es el bundler default de `next build` en 16; no requiere flag.
