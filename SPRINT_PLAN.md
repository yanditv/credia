# SPRINT_PLAN.md — Plan Hackathon 3 Días

> Cada tarea tiene una duración estimada. Prioridad: que el demo funcione.
> Usar vibe coding agresivo con Claude — generar código, no escribirlo.

---

## ⏱️ Día 1 — Infraestructura + Auth + Core

**Meta:** Login funcionando, schema listo, estructura completa.

### Bloque 1 (2h) — Setup
- [ ] Crear monorepo con `npm workspaces` o `pnpm`
- [ ] Inicializar NestJS (`nest new packages/api`)
- [ ] Inicializar Next.js 16 (`npx create-next-app@latest apps/web --typescript --tailwind --app --turbopack`)
- [ ] Docker Compose con PostgreSQL + Redis + MinIO
- [ ] `.env` y `.env.example` base
- [ ] GitHub repo + primera commit

**Prompt Claude:**
> "Genera el docker-compose.yml para Credia con PostgreSQL 15, Redis 7, y MinIO. Incluye healthchecks, volúmenes persistentes y variables de entorno."

---

### Bloque 2 (2h) — Prisma Schema
- [ ] Instalar Prisma en NestJS
- [ ] Schema completo según CLAUDE.md (todos los modelos)
- [ ] Primera migración
- [ ] Seed con admin user y datos de prueba

**Prompt Claude:**
> "Genera el schema completo de Prisma para Credia con los modelos: User, BusinessProfile, IncomeRecord, CreditScore, LoanRequest, Loan, LoanPayment. Incluye todos los enums y relaciones."

---

### Bloque 3 (2h) — Auth Module NestJS
- [ ] `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`
- [ ] DTOs: `RegisterDto`, `LoginDto`
- [ ] JWT strategy + guards
- [ ] Refresh token
- [ ] Decoradores: `@CurrentUser()`, `@Roles()`
- [ ] Swagger decoradores en todos los endpoints

**Prompt Claude:**
> "Genera el módulo auth completo de NestJS para Credia con registro, login, JWT, refresh tokens y guards de roles (USER, ADMIN, RISK_ANALYST). Usa class-validator, @nestjs/jwt y Prisma."

---

### Bloque 4 (2h) — Users + Business Profiles
- [ ] Módulo users (CRUD, perfil propio)
- [ ] Módulo business-profiles
- [ ] Upload de foto de perfil (MinIO)
- [ ] Endpoints admin básicos

---

### Bloque 5 (2h) — Frontend Auth + Layout
- [ ] Next.js App Router setup
- [ ] Shadcn instalación y configuración
- [ ] Layout admin: sidebar + topbar
- [ ] Página login con form
- [ ] Auth context / Zustand store
- [ ] Middleware de rutas protegidas

**Prompt Claude:**
> "Genera el layout admin de Next.js para Credia con sidebar oscuro (slate-900), logo, navegación con íconos Lucide, y topbar. Usa Shadcn y Tailwind v4. Recuerda que params son async en Next.js 16. El sidebar debe tener estos items: Dashboard, Usuarios, Solicitudes (con badge), Créditos Activos, Pagos, Mora, Reportes, Auditoría."

---

## ⏱️ Día 2 — Features Core + Admin Dashboard

**Meta:** Flujo completo de usuario (registro → score → solicitud → aprobación).

### Bloque 1 (2h) — Income Records
- [ ] Módulo `income-records` en NestJS
- [ ] CRUD de ventas diarias
- [ ] Upload de evidencias (foto/PDF)
- [ ] Cálculo de promedio mensual
- [ ] Endpoint resumen estadísticas
- [ ] Frontend: formulario de registro de venta

**Prompt Claude:**
> "Genera el módulo income-records en NestJS con controller, service, DTOs y endpoints. Debe permitir crear registros de ventas con evidencia (URL de archivo), listar historial del usuario y calcular promedio mensual. Incluye decoradores Swagger."

---

### Bloque 2 (2h) — Motor de Scoring
- [ ] Módulo `scores` en NestJS
- [ ] Algoritmo de cálculo con 6 componentes
- [ ] Guardado de score con hash SHA256
- [ ] Historial de scores
- [ ] Endpoint de recálculo
- [ ] Lógica de cupo máximo por score

**Prompt Claude:**
> "Genera el servicio de scoring para Credia en NestJS. El score va de 0-1000 con estos pesos: historial de pagos (30%), ventas constantes (25%), reputación comercial (15%), comportamiento de uso (10%), documentación verificada (10%), antigüedad del negocio (10%). Genera el hash SHA256 del score para guardarlo en blockchain. Incluye interfaz ScoreBreakdown."

---

### Bloque 3 (2h) — Loan Requests + Loans
- [ ] Módulo `loan-requests` en NestJS
- [ ] Validación de score mínimo antes de solicitar
- [ ] Límite de monto según score
- [ ] Estado machine: PENDING → APPROVED/REJECTED
- [ ] Módulo `loans` con generación de cuotas
- [ ] Módulo `payments`

**Prompt Claude:**
> "Genera los módulos loan-requests y loans para Credia en NestJS. loan-requests valida que el usuario tenga score ≥ 400 y que el monto solicitado no supere el cupo (score 400-599=$50, 600-749=$150, 750+=$300). loans gestiona créditos activos con estado y registro de pagos."

---

### Bloque 4 (2h) — Dashboard Admin
- [ ] Página `/admin/dashboard` con métricas
- [ ] 4 KPI cards: total prestado, recuperado, mora, score promedio
- [ ] LineChart de créditos (últimos 30 días)
- [ ] Tabla solicitudes pendientes
- [ ] Mini-panel mora

**Prompt Claude:**
> "Genera el dashboard principal del admin de Credia en Next.js con Tailwind y Recharts. Incluye 4 MetricCards (total prestado, total recuperado, % mora, score promedio), un LineChart de créditos desembolsados en los últimos 30 días, y una tabla de las últimas 5 solicitudes pendientes. Usa datos mock tipados en TypeScript."

---

### Bloque 5 (2h) — Score UI + Loan Request Flow
- [ ] Componente `ScoreGauge` (radial bar animado)
- [ ] Componente `ScoreBreakdown` (6 barras)
- [ ] Página perfil de usuario (vista admin)
- [ ] Formulario solicitud de crédito
- [ ] Aprobación/rechazo inline en tabla
- [ ] Toast notifications

**Prompt Claude:**
> "Genera el componente ScoreGauge para Credia en React con Recharts RadialBarChart. Debe mostrar el score (0-1000) con color dinámico según nivel de riesgo, el número central en fuente monospace, y una animación de llenado al cargar. Incluye el label del nivel de riesgo y el cupo máximo en USDC."

---

## ⏱️ Día 3 — Blockchain + Polish + Deploy

**Meta:** Solana integrado, demo pulido, deployment en vivo.

### Bloque 1 (2h) — Smart Contract Anchor
- [ ] Setup proyecto Anchor en `packages/blockchain`
- [ ] Programa `credia_reputation` en Rust
- [ ] Instrucciones: create_reputation, update_score, create_loan, register_payment, close_loan, mark_default
- [ ] Tests básicos TypeScript
- [ ] Build y deploy en devnet

**Prompt Claude:**
> "Genera el programa Anchor en Rust llamado credia_reputation para Solana. Debe tener las cuentas: UserReputation (wallet, score_hash, reputation_score), LoanRecord (loan_id_hash, user_wallet, amount_hash, status) y PaymentRecord. Instrucciones: create_reputation_profile, update_score_hash, create_loan_record, register_payment, close_loan, mark_default. Sin datos personales, solo hashes y estados."

---

### Bloque 2 (2h) — Blockchain Service NestJS
- [ ] Módulo `blockchain` en NestJS
- [ ] Cliente Solana con `@solana/web3.js`
- [ ] Funciones: registerScoreHash, registerLoan, registerPayment
- [ ] Hook automático: al aprobar crédito → registrar en Solana
- [ ] Guardado de tx hash en PostgreSQL

**Prompt Claude:**
> "Genera el servicio blockchain en NestJS para Credia que conecta con el programa Solana credia_reputation. Debe incluir funciones para: registrar hash de score (SHA256), registrar crédito aprobado, registrar pago. Usa @solana/web3.js v2 y Anchor 0.31 IDL. Red: devnet por defecto."

---

### Bloque 3 (1.5h) — Blockchain UI
- [ ] Badge `SolanaVerified` en cards de score
- [ ] Timeline de eventos blockchain en perfil de usuario
- [ ] Link a Solana Explorer (devnet)
- [ ] Estado de transacción (pendiente/confirmado)

---

### Bloque 4 (1.5h) — Polish UI
- [ ] Responsive completo
- [ ] Loading states en todas las páginas
- [ ] Error handling global
- [ ] Empty states con mensajes útiles
- [ ] Animaciones suaves
- [ ] Dark mode consistente

---

### Bloque 5 (2h) — Deploy
- [ ] Dockerfile para NestJS
- [ ] Dockerfile para Next.js
- [ ] `docker-compose.prod.yml`
- [ ] Variables de entorno en Fly.io o VPS
- [ ] Dominio + SSL con Cloudflare
- [ ] Test de smoke del demo flow

**Prompt Claude:**
> "Genera el Dockerfile multi-stage para el backend NestJS de Credia (build + prod) y el Dockerfile para Next.js. Incluye también el docker-compose.prod.yml con todas las variables de entorno necesarias."

---

### Bloque Final (1h) — Demo Prep
- [ ] Seed con datos realistas de demo
- [ ] Usuario demo: "María García" — vendedora de mercado, Quito
- [ ] Score: 642 → cupo $150 USDC
- [ ] Crédito activo con 1 pago registrado
- [ ] Hash en Solana devnet real
- [ ] README.md completo
- [ ] Video demo grabado (2 min)

---

## 🎯 Prompts Clave para Vibe Coding

### Setup inicial completo
```
Actúa como arquitecto senior. Crea la estructura completa del monorepo 
para Credia: un proyecto fintech con NestJS (packages/api), Next.js 
(apps/web), y Anchor/Solana (packages/blockchain). 

Stack: NestJS + Prisma + PostgreSQL + Redis, Next.js 14 App Router + 
Tailwind + Shadcn, Docker Compose.

Genera: estructura de carpetas, package.json raíz con workspaces, 
docker-compose.yml, .env.example, y los archivos de configuración base.
```

### Módulo NestJS completo
```
Genera el módulo [NOMBRE] completo para NestJS en Credia.

Incluye:
- [nombre].module.ts
- [nombre].controller.ts (con decoradores Swagger)
- [nombre].service.ts (con Prisma)
- dto/create-[nombre].dto.ts
- dto/update-[nombre].dto.ts

El módulo debe tener protección JWT y roles según corresponda.
Usa class-validator en los DTOs.
```

### Componente React completo
```
Genera el componente [NOMBRE] para el admin panel de Credia.

Stack: Next.js 16, TypeScript, Tailwind v4, Shadcn.
Tema: oscuro (slate-900, slate-800).
Color primario: green-500.

El componente debe:
- [descripción de funcionalidad]
- Tener loading state con skeleton
- Tener empty state con mensaje
- Ser responsive

Usa datos mock tipados inicialmente.
```

---

## 🏆 Criterios de Éxito del Demo

Al terminar los 3 días, el jurado debe ver:

1. ✅ **Flujo completo funciona** — usuario se registra, genera score, solicita crédito, se aprueba, registra pago
2. ✅ **Score explicable** — no es caja negra, muestra breakdown de 6 componentes
3. ✅ **On-chain verificable** — hash del score y eventos en Solana Explorer devnet (enlace real)
4. ✅ **UI profesional** — se ve como producto real, no como hackathon
5. ✅ **USDC visible** — aunque sea mock, mostrar flujo con USDC
6. ✅ **Admin panel** — dashboard con métricas, aprobación en 1 click
7. ✅ **Desplegado** — URL real accesible, no localhost

---

## 🆘 Plan B (si el tiempo no alcanza)

### Cuts seguros (no afectan el demo)
- ❌ App móvil (React Native) → solo web
- ❌ Refresh tokens → solo JWT básico
- ❌ Email notifications → skip
- ❌ Recuperación de contraseña → skip
- ❌ Upload real de archivos → URL de imagen mock
- ❌ Pagos USDC reales → mostrar flujo visual

### Hardcodear para demo (OK en hackathon)
- Score calculation en frontend (sin API)
- Hash de Solana pre-generado (pero mostrar tx real)
- Usuario demo pre-creado con seed
- Datos de gráficos como mock hasta conectar API
