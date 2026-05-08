# CLAUDE.md — Credia Project Guide

> Guía maestra para desarrollo asistido por IA (vibe coding).
> Este archivo le dice a Claude exactamente qué es el proyecto, cómo está estructurado y cómo debe ayudarte.
>
> **Antes de generar código, leer también [CONTRIBUTING.md](CONTRIBUTING.md)** — contiene el modelo de ramas, convenciones de commits/PR, y reglas obligatorias para asistentes de IA.

---

## 🧠 Contexto del Proyecto

**Credia** es una plataforma fintech para microcréditos a trabajadores informales en Latinoamérica. Construye un score financiero alternativo usando ventas, pagos, facturas, reputación comercial y comportamiento de pago — sin requerir historial bancario.

**Objetivo de la Hackathon:** Demostrar que un trabajador informal puede construir un perfil financiero verificable y acceder a un microcrédito en menos de 10 minutos.

---

## 🏗️ Stack Tecnológico

### Frontend (Web Admin + Landing)
- **Next.js 16.2** (App Router, Turbopack por defecto, React 19.2)
- **React 19.2** (React Compiler estable, Server Actions, View Transitions)
- **Tailwind CSS v4**
- **Shadcn/ui** (compatible con React 19)
- **TanStack Query v5**
- **Zustand v5** (estado global)
- **Recharts v2** (gráficos)

### Backend
- **NestJS 11** (framework modular, CommonJS estable)
- **PostgreSQL 16** (datos relacionales)
- **Prisma 6** (ORM)
- **Redis 7** (caché + colas)
- **BullMQ 5** (jobs asíncronos)
- **JWT** (autenticación)
- **Swagger / @nestjs/swagger 8** (documentación API)

### Blockchain
- **Solana** (red principal)
- **Anchor Framework 0.31** (smart contracts en Rust)
- **@solana/web3.js v2** (integración JS — nueva API)
- **@coral-xyz/anchor 0.31** (cliente TypeScript)
- **USDC** (stablecoin para desembolsos)

### Wallets
- **Phantom**
- **Solflare**

### Infra
- **Docker + Docker Compose** (desarrollo local)
- **Coolify** (deployment self-hosted)
- **Cloudflare** (DNS + CDN + proxy)
- **Fly.io o VPS** (alternativa de hosting)

---

## 📁 Estructura del Monorepo

```
credia/
├── apps/
│   ├── web/              # Next.js admin + landing
│   └── mobile/           # React Native Expo (post-hackathon)
├── packages/
│   ├── api/              # NestJS backend
│   ├── blockchain/       # Anchor program (Rust) + TS client
│   ├── shared/           # Types, utils, constants compartidos
│   └── ui/               # Componentes compartidos (si aplica)
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── nginx/
├── docs/
│   ├── CLAUDE.md         # Este archivo
│   ├── DESIGN.md         # Sistema de diseño
│   ├── API.md            # Contratos de API
│   ├── BLOCKCHAIN.md     # Documentación Solana
│   └── SPRINT_PLAN.md    # Plan de 3 días
└── scripts/
    ├── seed.ts
    └── deploy.sh
```

---

## 🗄️ Módulos NestJS

Cada módulo sigue la estructura: `controller → service → repository → prisma`

| Módulo | Responsabilidad |
|--------|----------------|
| `auth` | Registro, login, JWT, refresh tokens |
| `users` | Perfil personal, wallet address, KYC básico |
| `business-profiles` | Datos del negocio, tipo, ciudad, antigüedad |
| `income-records` | Ventas diarias, facturas, comprobantes |
| `scores` | Cálculo de score, historial, cupos |
| `loan-requests` | Solicitudes de crédito, validación |
| `loans` | Créditos activos, cuotas, estados |
| `payments` | Registro de pagos, USDC on-chain |
| `blockchain` | Bridge con Solana, registro de hashes |
| `audit` | Logs de auditoría, consentimientos |
| `admin` | Endpoints protegidos para administradores |

---

## 🔐 Roles y Permisos

```typescript
enum Role {
  USER = 'USER',           // Trabajador informal
  ADMIN = 'ADMIN',         // Administrador Credia
  RISK_ANALYST = 'RISK_ANALYST'  // Analista de riesgo
}
```

### Guards a implementar
- `JwtAuthGuard` — verifica token válido
- `RolesGuard` — verifica rol requerido
- `OwnerGuard` — verifica que el recurso pertenece al usuario

---

## 📊 Modelo de Datos Prisma

```prisma
model User {
  id              String   @id @default(cuid())
  fullName        String
  documentNumber  String   @unique
  phone           String
  email           String   @unique
  walletAddress   String?
  role            Role     @default(USER)
  status          UserStatus @default(PENDING)
  createdAt       DateTime @default(now())
  
  businessProfile BusinessProfile?
  incomeRecords   IncomeRecord[]
  creditScores    CreditScore[]
  loanRequests    LoanRequest[]
  loans           Loan[]
}

model BusinessProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  businessName          String
  businessType          BusinessType
  city                  String
  monthlyEstimatedIncome Decimal
  yearsActive           Int
  createdAt             DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}

model IncomeRecord {
  id          String      @id @default(cuid())
  userId      String
  sourceType  SourceType
  amount      Decimal
  description String?
  evidenceUrl String?
  recordDate  DateTime
  createdAt   DateTime    @default(now())
  
  user User @relation(fields: [userId], references: [id])
}

model CreditScore {
  id              String   @id @default(cuid())
  userId          String
  score           Int      // 0-1000
  riskLevel       RiskLevel
  maxCreditAmount Decimal
  scoreHash       String   // hash guardado en Solana
  breakdown       Json     // detalle de cada componente
  blockchainTx    String?  // tx de Solana
  createdAt       DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}

model LoanRequest {
  id              String          @id @default(cuid())
  userId          String
  requestedAmount Decimal
  termDays        Int
  purpose         String
  status          LoanRequestStatus @default(PENDING)
  scoreId         String
  createdAt       DateTime        @default(now())
  
  user  User @relation(fields: [userId], references: [id])
  loan  Loan?
}

model Loan {
  id              String     @id @default(cuid())
  userId          String
  loanRequestId   String     @unique
  principalAmount Decimal
  interestAmount  Decimal
  totalAmount     Decimal
  status          LoanStatus @default(ACTIVE)
  blockchainTx    String?
  createdAt       DateTime   @default(now())
  
  user        User        @relation(fields: [userId], references: [id])
  loanRequest LoanRequest @relation(fields: [loanRequestId], references: [id])
  payments    LoanPayment[]
}

model LoanPayment {
  id            String        @id @default(cuid())
  loanId        String
  amount        Decimal
  paymentMethod PaymentMethod
  status        PaymentStatus @default(PENDING)
  blockchainTx  String?
  paidAt        DateTime?
  createdAt     DateTime      @default(now())
  
  loan Loan @relation(fields: [loanId], references: [id])
}

// Enums
enum Role { USER ADMIN RISK_ANALYST }
enum UserStatus { PENDING ACTIVE SUSPENDED BLOCKED }
enum BusinessType { VENDOR MERCHANT DELIVERY TAXI STORE SERVICES AGRICULTURE OTHER }
enum SourceType { DAILY_SALES INVOICE QR_PAYMENT DELIVERY REFERENCE OTHER }
enum RiskLevel { HIGH MEDIUM ACCEPTABLE LOW }
enum LoanRequestStatus { PENDING APPROVED REJECTED CANCELLED }
enum LoanStatus { ACTIVE PAID DEFAULTED CANCELLED }
enum PaymentStatus { PENDING COMPLETED FAILED }
enum PaymentMethod { CASH TRANSFER USDC_ON_CHAIN }
```

---

## 🧮 Fórmula del Score

```typescript
interface ScoreBreakdown {
  constantSales: number;      // 25% — regularidad de ventas diarias
  paymentHistory: number;     // 30% — pagos anteriores cumplidos
  commercialReputation: number; // 15% — referencias y reputación
  businessAge: number;        // 10% — antigüedad del negocio
  verifiedDocs: number;       // 10% — documentación subida
  usageBehavior: number;      // 10% — comportamiento en la app
}

// Cupos por score
// < 400   → No aprobado
// 400-599 → hasta $50 USDC
// 600-749 → hasta $150 USDC
// 750-1000 → hasta $300 USDC

// Plazos: 7, 15, 30 días
// Interés MVP: 5-10% (revisar legalmente antes de producción)
```

---

## ⛓️ Blockchain — Qué va On-Chain

### Guardar en Solana (hashes y estados solamente)
```
✅ hash del score (SHA256)
✅ hash de documentos
✅ consentimiento del usuario (timestamp + wallet)
✅ estado del crédito
✅ eventos: solicitud → aprobado → desembolsado → pagado → cerrado → mora
✅ reputación verificable
```

### NUNCA guardar en Solana
```
❌ nombre
❌ cédula / RUC
❌ teléfono
❌ ingresos exactos
❌ dirección
❌ documentos privados
```

### Programa Anchor: `credia_reputation`
```rust
// Entidades on-chain
UserReputation { wallet, score_hash, reputation_score, total_loans, loans_paid, created_at }
LoanRecord { loan_id_hash, user_wallet, amount_hash, status, created_at, closed_at }
PaymentRecord { loan_id_hash, amount_hash, paid_at, tx_signature }

// Instrucciones
create_reputation_profile
update_score_hash
create_loan_record
register_payment
close_loan
mark_default
```

---

## 🌐 Endpoints API REST

### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
```

### Users
```
GET    /users/me
PATCH  /users/me
POST   /users/me/wallet
```

### Business Profiles
```
POST   /business-profile
GET    /business-profile/me
PATCH  /business-profile/me
```

### Income Records
```
POST   /income-records
GET    /income-records/me
GET    /income-records/me/summary
```

### Scores
```
POST   /scores/calculate
GET    /scores/me
GET    /scores/me/latest
```

### Loan Requests
```
POST   /loan-requests
GET    /loan-requests/me
```

### Loans
```
GET    /loans/me
GET    /loans/:id
GET    /loans/:id/payments
POST   /loans/:id/payments
```

### Admin (requiere rol ADMIN o RISK_ANALYST)
```
GET    /admin/users
GET    /admin/users/:id
GET    /admin/income-records/:userId
GET    /admin/scores/:userId
GET    /admin/loan-requests
PATCH  /admin/loan-requests/:id/approve
PATCH  /admin/loan-requests/:id/reject
GET    /admin/loans
GET    /admin/dashboard/metrics
```

---

## 🆕 Cambios Importantes en Next.js 16 / React 19.2

Tener presentes estos cambios al escribir prompts para vibe coding:

### `params` y `searchParams` son ahora async
```typescript
// ✅ Next.js 16 — async obligatorio
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  const query = await props.searchParams
  return <h1>{slug}</h1>
}

// ❌ Ya no funciona en Next.js 16
export default function Page({ params }: { params: { slug: string } }) {
  return <h1>{params.slug}</h1>
}
```

### Turbopack es el bundler por defecto
```bash
# next dev ya usa Turbopack automáticamente (no necesita --turbopack flag)
npm run dev
```

### React Compiler estable (auto-memoización)
```javascript
// next.config.ts — habilitar React Compiler
const nextConfig = {
  reactCompiler: true,  // Stable en Next.js 16
}
```

### Tailwind CSS v4 — configuración en CSS
```css
/* globals.css — no necesita tailwind.config.js */
@import "tailwindcss";

/* Colores custom con CSS variables nativas */
@theme {
  --color-credia-green: #22c55e;
  --color-surface: #1e293b;
}
```

### `use cache` directiva (nueva en Next.js 16)
```typescript
// Cacheo granular sin necesidad de fetch options
async function getMetrics() {
  'use cache'
  return await db.query(...)
}
```

## 🎯 Reglas para Claude (vibe coding)

Cuando trabajes en este proyecto, sigue estas reglas:

1. **Next.js 16 con App Router.** `params` y `searchParams` siempre async.
2. **Tailwind v4.** Configuración en `globals.css` con `@import "tailwindcss"`, sin `tailwind.config.js`.
3. **React 19.2.** Usar `use()` hook, Server Actions con `'use server'`, y `useOptimistic`.
4. **Usa el stack definido.** No sugieras otras tecnologías sin justificación.
5. **Modular siempre.** Cada módulo NestJS tiene su propio folder con controller, service, dto, module.
6. **Tipado estricto.** TypeScript strict mode, sin `any`.
7. **No datos sensibles en blockchain.** Solo hashes y estados.
8. **Swagger en todos los endpoints.** Decoradores `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`.
6. **Variables de entorno.** Nunca hardcodear secrets. Usar `@nestjs/config`.
7. **Manejo de errores.** Usar `HttpException` con mensajes claros en español.
8. **Guards en rutas protegidas.** `@UseGuards(JwtAuthGuard, RolesGuard)`.
9. **Validación con class-validator.** DTOs con decoradores de validación.
10. **Commits atómicos.** Un feature a la vez.

---

## ⚡ Comandos Rápidos

```bash
# Crear proyecto Next.js 16 con Turbopack
npx create-next-app@latest apps/web --typescript --tailwind --app --turbopack

# Dev local
docker-compose up -d           # Levanta PostgreSQL + Redis
cd packages/api && npm run start:dev
cd apps/web && npm run dev     # Usa Turbopack automáticamente

# Base de datos
npx prisma migrate dev         # Nueva migración
npx prisma studio              # GUI de base de datos
npx prisma db seed             # Seed inicial

# Tailwind v4 (no necesita tailwind.config.js, se configura en CSS)
# En globals.css: @import "tailwindcss";

# Solana (devnet)
anchor build
anchor deploy --provider.cluster devnet
anchor test

# Docker completo
docker-compose -f docker-compose.yml up --build
```

---

## 🔑 Variables de Entorno (.env)

```env
# App
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://credia:credia@localhost:5432/credia_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=super-secret-change-in-prod
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=refresh-secret
JWT_REFRESH_EXPIRATION=30d

# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=<deployed-program-id>
ADMIN_WALLET_PRIVATE_KEY=<admin-wallet-keypair>

# Storage (MinIO o S3)
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=credia-docs

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

---

## 📋 Checklist Hackathon (3 días)

### Día 1 — Fundamentos
- [ ] Monorepo configurado
- [ ] Docker Compose funcionando (PostgreSQL + Redis)
- [ ] NestJS con módulos base
- [ ] Prisma schema + migraciones
- [ ] Auth completo (registro, login, JWT)
- [ ] CRUD usuarios y perfiles de negocio
- [ ] Swagger documentado
- [ ] Next.js con layout y autenticación

### Día 2 — Core Features
- [ ] Registro de ingresos y evidencias
- [ ] Motor de scoring (reglas simples)
- [ ] Solicitud de crédito con validación
- [ ] Aprobación/rechazo admin
- [ ] Registro de pagos
- [ ] Dashboard admin con métricas
- [ ] Integración básica Solana devnet

### Día 3 — Demo & Polish
- [ ] Smart contract Anchor desplegado en devnet
- [ ] Hash de score registrado on-chain
- [ ] UI pulida y responsive
- [ ] Flujo completo demo (registro → score → crédito → pago)
- [ ] README completo
- [ ] Video demo (2 min)
- [ ] Deployment en Fly.io o VPS

---

## 🎪 Demo Flow (para presentar)

1. Usuario se registra como vendedor ambulante en Quito
2. Completa perfil de negocio (puesto de mercado, 3 años)
3. Registra ventas de la última semana ($15-40/día)
4. Sube foto de comprobante de pago
5. **El sistema calcula su score: 620/1000 → Riesgo Aceptable**
6. Solicita crédito de $100 USDC a 30 días
7. Admin aprueba desde el panel
8. **Hash del score + crédito quedan registrados en Solana devnet**
9. Usuario ve su historial verificable
10. Registra pago → reputación mejora on-chain

**Mensaje clave:** *"Convierte tus ventas diarias en acceso a crédito."*
