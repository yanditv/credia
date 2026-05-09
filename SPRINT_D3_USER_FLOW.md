# Sprint Final Día 3 — Cerrar el flujo del trabajador informal

> **Fecha:** 2026-05-09 — tarde Día 3
> **Owners:** Junior (frontend), Cesar (api), Daniel (blockchain)
> **Estado de partida:** Develop tip `23eebf5`. Admin panel 100% funcional. Backend API completo. Blockchain integrado en approve/payment. **Falta el flujo end-to-end del USER.**

---

## 🎯 Objetivo

Que el demo del CLAUDE.md sea ejecutable de cabo a rabo en menos de 10 minutos:

> *Vendedor ambulante registra → completa perfil → registra ventas → sube comprobante → calcula score → solicita crédito → admin aprueba → ve hash on-chain → registra pago.*

Hoy de los 10 pasos funcionan 5 (4 admin + 1 hash). Faltan los 5 del USER.

---

## 🔥 Gaps detectados (auditoría)

| # | Gap | Impacto | Lane |
|---|---|---|---|
| 1 | NO existe `/registro` público (signup UI) | Bloquea paso 1 del demo | Junior |
| 2 | NO hay onboarding (perfil de negocio + wallet) | Bloquea pasos 2-3 | Junior |
| 3 | NO hay rutas USER (`/mi-perfil`, `/mis-ventas`, `/mi-score`) | El user usa páginas admin | Junior |
| 4 | NO hay file upload (API + UI) — `evidenceUrl` solo acepta string | Score `verifiedDocs` (10%) jamás sube | Cesar + Junior |
| 5 | Home redirige todos a `/admin/dashboard` (incluso USER) | UX rota | Junior |
| 6 | USER no puede ver su reputación on-chain | Pierde el hook de marketing | Daniel + Junior |

---

## 📦 Plan de ejecución

### 🎨 Junior — Frontend (yanditv)

**Lane:** `apps/web/**`
**Tiempo estimado:** ~4-5h
**Bloqueado por:** Cesar para upload (D2), Daniel para reputation lookup (D5 opcional)

#### J1. `feat/web/signup-page` — página `/registro` pública (~30 min)
- Branch: `feat/web/signup-page`
- Crear `apps/web/app/registro/page.tsx` con form: `fullName`, `documentNumber`, `phone`, `email`, `password`
- Reusar `apps/web/lib/api.ts` para llamar `POST /auth/register`
- Reusar componentes: `Input`, `Label`, `Button`, `Card` (ya existen)
- Después de registro exitoso → guardar token + redirect a `/onboarding`
- Link "¿Ya tenés cuenta? Iniciá sesión" → `/login`
- En `/login` agregar link inverso "Crear cuenta" → `/registro`
- **DoD:** desde `/login`, click "Crear cuenta", llenar form, queda logueado y va a `/onboarding`

#### J2. `feat/web/onboarding-wizard` — onboarding 3 pasos (~1.5h)
- Branch: `feat/web/onboarding-wizard`
- Crear `apps/web/app/onboarding/page.tsx` (wizard con `useState` para step 1/2/3)
- **Step 1 — Perfil de negocio:** form `businessName`, `businessType` (select de enum), `city`, `monthlyEstimatedIncome`, `yearsActive` → `POST /business-profile`
- **Step 2 — Wallet (opcional, skip permitido):** reusar `WalletButton` ya existente; al conectar → `POST /users/me/wallet` con `walletAddress`
- **Step 3 — Bienvenida:** CTA "Registrar mi primera venta" → `/mis-ventas`
- Si el usuario ya tiene `businessProfile`, saltar Step 1
- Stepper visual arriba con los 3 pasos numerados
- **DoD:** USER recién registrado completa los 3 pasos y termina en `/mis-ventas`

#### J3. `feat/web/user-routes` — rutas USER + sidebar dual (~2h)
- Branch: `feat/web/user-routes`
- Crear layout `apps/web/app/(user)/layout.tsx` con sidebar propio (5 items: Mi perfil, Mis ventas, Mi score, Solicitar crédito, Mis créditos)
- Crear páginas:
  - `app/(user)/mi-perfil/page.tsx` — datos personales + business profile + wallet (editable)
  - `app/(user)/mis-ventas/page.tsx` — listado de income-records + form para nuevo registro (incluye dropzone de J5)
  - `app/(user)/mi-score/page.tsx` — score-gauge grande + breakdown 6 componentes + botón "Recalcular score" → `POST /scores/calculate`
  - `app/(user)/solicitar-credito/page.tsx` — reusar `LoanRequestForm` (ya existe)
  - `app/(user)/mis-creditos/page.tsx` — reusar `LoansTable` con filtro automático "solo míos"
- Reusar componentes existentes: `score-gauge.tsx`, `LoanRequestForm`, `LoansTable`, `PaymentsTable`
- **Modificar `app/page.tsx` (home)** — redirect según rol:
  - `accessToken && user.role === 'USER'` → `/mi-perfil`
  - `accessToken && user.role !== 'USER'` → `/admin/dashboard`
  - sin token → `/login`
- Usar route group `(user)` para no contaminar URL
- **DoD:** USER ve sidebar de 5 items, puede registrar ventas, ver score, solicitar crédito sin tocar `/admin/*`

#### J4. `feat/web/upload-component` — componente Dropzone (~30 min)
- **Bloqueado por:** Cesar D2
- Branch: `feat/web/upload-component`
- Crear `apps/web/components/ui/file-upload.tsx`:
  - Drag & drop usando HTML5 nativo (sin libs nuevas — keep bundle small)
  - Aceptar `image/*` y `application/pdf`, max 5MB
  - Al drop → `POST /upload` (multipart/form-data) con campo `file`
  - Mostrar preview (img tag para imágenes, ícono+nombre para PDF)
  - Devolver `evidenceUrl` para que el form padre lo asigne
- Integrar en form de income-records de J3 (`mis-ventas`)
- Crear `apps/web/lib/api/upload.ts` con cliente tipado
- **DoD:** desde `/mis-ventas` puedo arrastrar foto del comprobante, sube a MinIO, y al guardar la venta queda con `evidenceUrl`

#### J5. `feat/web/onchain-reputation` (OPCIONAL, si Daniel hace D5) — ver mi reputación (~30 min)
- **Bloqueado por:** Daniel D5
- Branch: `feat/web/onchain-reputation`
- En `/mi-score` agregar sección "Verificable en blockchain" con:
  - Score hash truncado + link al explorer (reusar `TransactionLink`)
  - Total de créditos pagados (lectura on-chain)
  - Badge "✓ Verificado en Solana devnet"
- Llamar a `GET /users/me/reputation` (endpoint que provee Daniel)

---

### ⚙️ Cesar — Backend API (pumamz)

**Lane:** `packages/api/src/**`
**Tiempo estimado:** ~1.5h
**No bloqueado por nadie** — puede arrancar ya

#### C1. `feat/api/upload-module` — módulo upload con MinIO (~1.5h)
- Branch: `feat/api/upload-module`
- Instalar deps:
  ```bash
  cd packages/api
  npm install @nestjs/platform-express multer minio
  npm install -D @types/multer
  ```
- Crear `packages/api/src/upload/`:
  - `upload.module.ts`
  - `upload.controller.ts` — `POST /upload` con `@UseInterceptors(FileInterceptor('file'))` + `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth`
  - `upload.service.ts` — cliente MinIO; bucket `credia-docs`; key formato `{userId}/{timestamp}-{filename}`; devolver URL pública
  - `dto/upload-response.dto.ts` — `{ url: string, key: string, contentType: string, size: number }`
- Validaciones:
  - max 5MB (`limits: { fileSize: 5 * 1024 * 1024 }`)
  - mimetype whitelist: `['image/jpeg', 'image/png', 'image/webp', 'application/pdf']`
  - `BadRequestException` con mensaje en español si falla
- Configurar bucket MinIO al boot del service (`ensureBucketExists`)
- Setear policy de bucket pública (read-only) para que `evidenceUrl` sea accesible
- Registrar `UploadModule` en `app.module.ts`
- Swagger: `@ApiOperation({ summary: 'Subir comprobante o documento' })`, `@ApiConsumes('multipart/form-data')`, `@ApiBody` con schema multipart
- **DoD:** `curl -F file=@foto.jpg -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/upload` devuelve `{ url, key, contentType, size }` y la URL es accesible vía GET

**Nota:** las env vars `STORAGE_*` ya están en `.env.example` — solo conectarlas al `MinioService`.

---

### ⛓️ Daniel — Blockchain (Famiitry)

**Lane:** `packages/blockchain/**` + `packages/api/src/blockchain/**`
**Tiempo estimado:** ~1.5h (si toma D5; D6 opcional)
**No bloqueado por nadie**

#### D5. `feat/api/reputation-lookup` — endpoint para que el USER vea su reputación on-chain (~1h)
- Branch: `feat/api/reputation-lookup`
- En `packages/api/src/blockchain/blockchain.service.ts` agregar método `getUserReputation(walletAddress: string)`:
  - Derivar PDA `UserReputation` desde el wallet del user (seeds: `["reputation", wallet]`)
  - Hacer `connection.getAccountInfo(pda)` y deserializar con el cliente Codama (PR #25)
  - Devolver `{ scoreHash, reputationScore, totalLoans, loansPaid, createdAt, pda, explorerUrl }`
  - Si la cuenta no existe (user nunca tuvo crédito aprobado) → devolver `null` o 404
- Crear endpoint en `users.controller.ts`: `GET /users/me/reputation` (protegido con `JwtAuthGuard`)
- DTO `ReputationResponseDto` para Swagger
- **DoD:** desde el wallet de `demo@credia.io`, `GET /users/me/reputation` devuelve los datos del PDA on-chain (o 404 si nunca tuvo crédito)

#### D6. `feat/blockchain/usdc-disbursement` (OPCIONAL — solo si hay tiempo) — desembolso real USDC en devnet (~1.5h)
- Branch: `feat/blockchain/usdc-disbursement`
- Cuando admin aprueba un loan-request, además de registrar el `LoanRecord` on-chain, **transferir USDC reales en devnet** del admin wallet al user wallet
- Usar SPL token transfer con USDC mint de devnet (`Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr` o el oficial de Circle devnet)
- Si el user no tiene ATA → crear primero
- Guardar tx signature en `Loan.blockchainTx`
- **Trade-off:** si el admin wallet no tiene USDC devnet → el approve falla. Considerar feature flag `USDC_DISBURSEMENT_ENABLED=false` por defecto en demo, true para showcase.
- **DoD:** después de approve, ver en Solana Explorer la transferencia de USDC del admin wallet al user wallet

---

## 🗓️ Orden recomendado y paralelización

```
Tiempo →
─────────────────────────────────────────────────────────────────►

Cesar:    [████ C1: upload-module ████]
                                       ↓ desbloquea J4

Junior:   [██ J1 ██][████ J2 ████][████████ J3 ████████][██ J4 ██]
                                                          (con C1 listo)

Daniel:   [████ D5: reputation lookup ████][???? D6 opt ????]
                                            ↓ desbloquea J5 (opcional)
```

**Wave 1 (paralelo, arrancan ya):**
- Cesar → C1 (upload module) — bloqueante para J4
- Daniel → D5 (reputation lookup) — bloqueante opcional para J5
- Junior → J1 (signup page) — sin dependencias

**Wave 2 (después de J1):**
- Junior → J2 (onboarding) → J3 (rutas USER)

**Wave 3 (después de C1):**
- Junior → J4 (upload component) — integrar dropzone en J3

**Wave 4 (opcional, después de D5):**
- Junior → J5 (on-chain reputation badge en /mi-score)

---

## 🚦 Definition of Done global

El demo del CLAUDE.md se ejecuta sin tocar la DB ni hacer trampa:

1. ✅ Abrir `localhost:3000/registro`
2. ✅ Crear cuenta nueva (`pedro@test.com`, password `demo1234`)
3. ✅ Onboarding: completar perfil de negocio (vendedor, Quito, $30/día, 3 años)
4. ✅ Conectar Phantom (devnet)
5. ✅ Registrar 5 ventas con foto de comprobante (drag & drop)
6. ✅ Click "Recalcular mi score" → ver score-gauge subir
7. ✅ Click "Solicitar crédito" → $100 USDC a 30 días
8. ✅ Login como admin → aprobar la solicitud
9. ✅ Volver al user → ver badge "✓ On-chain" + link al explorer
10. ✅ Registrar un pago → reputación mejora

---

## 🚧 Reglas obligatorias para esta ola

- **Lane discipline:** cada dev SOLO en su lane. Cross-lane fix = commit separado con `fix(<otra-area>):` y nota en PR.
- **PR pequeños:** un feature por PR. NO bundle. J3 puede ir en 1 PR pero con commits atómicos.
- **Tests humo, no exhaustivos:** dado el tiempo, priorizar happy path manual via UI/curl. Tests automatizados solo donde Daniel/Cesar ya tenían infra.
- **Reusar antes que crear:** check `components/ui/`, `components/loans/`, `lib/api/` antes de generar nada nuevo.
- **Idioma:** UI en español rioplatense/EC neutro (ya es el estilo del repo).

---

## 📋 Checklist pre-merge (cada PR)

- [ ] Branch creado desde develop fresh
- [ ] Lint + typecheck limpios
- [ ] Build pasa
- [ ] Probado manual en browser/curl
- [ ] Reviewers asignados (los otros 2 devs activos)
- [ ] Body del PR explica qué + cómo testear

---

## 🎬 Después de esto

Si todo merge antes de las 6pm: queda tiempo para video demo (Sebastián) y polish final.
Si algún PR queda abierto: priorizar los del flujo demo (J1-J3) sobre J4-J5 opcionales.

---

**Owners de coordinación:** Junior (frontend dependencies), Sebastián (demo + integración final).
