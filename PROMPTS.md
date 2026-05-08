# PROMPTS.md — Banco de Prompts para Vibe Coding

> Copia y pega estos prompts directamente en Claude durante la hackathon.
> Ordenados por día y módulo.

---

## 🏁 DÍA 1 — Setup y Auth

### P01 — Monorepo + Docker
```
Actúa como arquitecto senior. Soy el desarrollador de Credia, una plataforma fintech 
para microcréditos a trabajadores informales.

Genera la estructura de monorepo con npm workspaces:
- packages/api (NestJS)
- apps/web (Next.js 16 con Turbopack)
- packages/blockchain (Anchor)
- packages/shared (tipos compartidos)

Incluye:
1. package.json raíz con workspaces y scripts útiles
2. tsconfig.json base
3. .gitignore completo
4. .env.example con todas las variables necesarias (ver abajo)

Variables de entorno:
NODE_ENV, PORT, DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_EXPIRATION,
JWT_REFRESH_SECRET, SOLANA_NETWORK, SOLANA_RPC_URL, SOLANA_PROGRAM_ID,
ADMIN_WALLET_PRIVATE_KEY, STORAGE_ENDPOINT, STORAGE_ACCESS_KEY,
STORAGE_SECRET_KEY, STORAGE_BUCKET, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOLANA_NETWORK

Stack backend: NestJS 11, PostgreSQL 16, Prisma 6, Redis 7, JWT, Swagger
Stack frontend: Next.js 16 App Router, Tailwind CSS v4 (sin tailwind.config.js, usar @import "tailwindcss" en globals.css), Shadcn/ui compatible con React 19.2. IMPORTANTE: params y searchParams son async en Next.js 16.
```

---

### P02 — Prisma Schema Completo
```
Genera el schema completo de Prisma para Credia (packages/api/prisma/schema.prisma).

Modelos requeridos:
- User (id, fullName, documentNumber, phone, email, walletAddress, role, status, createdAt)
- BusinessProfile (id, userId, businessName, businessType, city, monthlyEstimatedIncome, yearsActive)
- IncomeRecord (id, userId, sourceType, amount, description, evidenceUrl, recordDate)
- ReputationEvent (id, userId, eventType, scoreImpact, metadata, createdAt)
- CreditScore (id, userId, score 0-1000, riskLevel, maxCreditAmount, scoreHash, breakdown Json, blockchainTx)
- LoanRequest (id, userId, requestedAmount, termDays, purpose, status, scoreId)
- Loan (id, userId, loanRequestId, principalAmount, interestAmount, totalAmount, status, blockchainTx)
- LoanPayment (id, loanId, amount, paymentMethod, status, blockchainTx, paidAt)
- AuditLog (id, userId, action, resource, resourceId, metadata, ipAddress, createdAt)

Enums:
- Role: USER, ADMIN, RISK_ANALYST
- UserStatus: PENDING, ACTIVE, SUSPENDED, BLOCKED
- BusinessType: VENDOR, MERCHANT, DELIVERY, TAXI, STORE, SERVICES, AGRICULTURE, OTHER
- SourceType: DAILY_SALES, INVOICE, QR_PAYMENT, DELIVERY, REFERENCE, OTHER
- RiskLevel: HIGH, MEDIUM, ACCEPTABLE, LOW
- LoanRequestStatus: PENDING, APPROVED, REJECTED, CANCELLED
- LoanStatus: ACTIVE, PAID, DEFAULTED, CANCELLED
- PaymentStatus: PENDING, COMPLETED, FAILED
- PaymentMethod: CASH, TRANSFER, USDC_ON_CHAIN

Incluye relaciones correctas, índices en campos frecuentemente buscados (email, documentNumber, userId).
Configura provider para PostgreSQL.
```

---

### P03 — Módulo Auth NestJS Completo
```
Genera el módulo auth completo para NestJS en Credia (packages/api/src/auth/).

Archivos a generar:
- auth.module.ts
- auth.controller.ts (con decoradores Swagger)
- auth.service.ts
- jwt.strategy.ts
- jwt-refresh.strategy.ts
- guards/jwt-auth.guard.ts
- guards/roles.guard.ts
- decorators/current-user.decorator.ts
- decorators/roles.decorator.ts
- dto/register.dto.ts (class-validator)
- dto/login.dto.ts

Funcionalidades:
- Registro con hash de contraseña (bcrypt)
- Login con JWT access token (7d) + refresh token (30d)
- Refresh token endpoint
- Guard de autenticación
- Guard de roles (USER, ADMIN, RISK_ANALYST)
- Decorador @CurrentUser() para obtener usuario del request
- Decorador @Roles() para definir roles requeridos

Usa @nestjs/jwt, @nestjs/passport, bcryptjs, class-validator.
Todos los endpoints con decoradores @ApiOperation, @ApiResponse, @ApiBearerAuth de Swagger.
Manejo de errores con HttpException en español.
```

---

### P04 — Layout Admin Next.js
```
Genera el layout completo del panel admin de Credia en Next.js 14 con App Router.

Stack: Next.js 16, TypeScript, Tailwind CSS v4, Shadcn/ui, Lucide React. Recuerda: params async, @import "tailwindcss" en globals.css.

Archivos a generar:
- app/(admin)/layout.tsx (layout principal con sidebar)
- components/layout/Sidebar.tsx
- components/layout/TopBar.tsx
- components/layout/NavItem.tsx

Especificaciones del Sidebar:
- Fondo: bg-slate-900, ancho 280px, fixed en desktop
- Logo "CREDIA" con dot verde arriba
- Navegación: Dashboard, Usuarios, Solicitudes (con badge de pendientes), Créditos Activos, Pagos, Mora, Reportes, Auditoría
- Ítem activo: bg-green-500/10, text-green-400, border-l-2 border-green-500
- Ítem hover: bg-slate-800
- Footer: avatar del admin, nombre, botón cerrar sesión
- Íconos de Lucide React para cada sección

TopBar:
- Fondo: bg-slate-800, border-b border-slate-700
- Título de la página actual
- Botón de búsqueda global
- Avatar del usuario logueado
- Badge de notificaciones

Colores del tema:
- Background: slate-950
- Surface: slate-900, slate-800
- Primary: green-500
- Text: slate-100, slate-400

Generar también middleware.ts para proteger rutas /admin/* con JWT.
```

---

## ⚡ DÍA 2 — Features Core

### P05 — Motor de Scoring
```
Genera el servicio de scoring completo para Credia en NestJS.

Archivo: packages/api/src/scores/scores.service.ts

La fórmula del score (0-1000) tiene 6 componentes:

1. Historial de pagos (30%): basado en loans_paid / total_loans × 30 puntos × 10
2. Ventas constantes (25%): regularidad en los últimos 30 días (días con registro / 30 × 250)
3. Reputación comercial (15%): basado en reputation_events positivos vs negativos
4. Comportamiento de uso (10%): días activos en la app en últimos 30 días / 30 × 100
5. Documentación verificada (10%): % de campos del perfil completados × 100
6. Antigüedad del negocio (10%): min(yearsActive / 3, 1) × 100

Implementar:
- ScoreBreakdown interface con cada componente y su contribución
- calculateScore(userId: string): Promise<CreditScore>
- generateScoreHash(scoreId, scoreValue): string (SHA256)
- getCreditLimit(score: number): number (retorna 0, 50, 150 o 300)
- getRiskLevel(score: number): RiskLevel
- Guardar score en DB con Prisma
- Historial de scores del usuario

También generar:
- scores.controller.ts con endpoints documentados en Swagger
- scores.module.ts
- dto/score-response.dto.ts

Manejar errores: si el usuario no tiene suficientes datos, retornar score 0 con explicación.
```

---

### P06 — Dashboard Admin con Recharts
```
Genera la página del dashboard principal del admin de Credia.

Archivo: apps/web/app/(admin)/dashboard/page.tsx

Stack: Next.js 16, TypeScript, Tailwind v4, Shadcn/ui, Recharts, Lucide React.

Componentes a generar:
1. MetricCard — card con icono, valor principal, tendencia (↑↓), subtítulo
2. DashboardChart — LineChart de Recharts con créditos desembolsados por día
3. RecentLoanRequests — tabla de últimas 5 solicitudes con estado badge
4. MoraAlert — banner de alertas si hay créditos en mora

Métricas del dashboard:
- Total Prestado: $4,250 USDC (trend: +12%)
- Total Recuperado: $3,100 USDC (trend: +8%)  
- Porcentaje de Mora: 2.3% (trend: -0.5%, verde porque bajó)
- Score Promedio: 642 (trend: +15pts)

Gráfico: LineChart con datos de los últimos 14 días.
Colores: verde para valores positivos, rojo para mora alta.
Fondo dark: slate-900/slate-800.
Cards con border slate-700.

Usar datos mock tipados en TypeScript, estructura preparada para conectar con API.
Incluir TanStack Query para el futuro fetch de datos.
```

---

### P07 — Score Gauge Component
```
Genera el componente ScoreGauge para Credia.

Archivo: apps/web/components/score/ScoreGauge.tsx

Especificaciones:
- Usar Recharts RadialBarChart
- Score de 0 a 1000 en escala visual
- Color dinámico según riesgo:
  * 0-399: #ef4444 (rojo) — "Alto Riesgo"
  * 400-599: #f59e0b (ámbar) — "Riesgo Medio"  
  * 600-749: #3b82f6 (azul) — "Riesgo Aceptable"
  * 750-1000: #22c55e (verde) — "Bajo Riesgo"
- Número central en fuente JetBrains Mono, tamaño grande
- Label del nivel de riesgo debajo del número
- Cupo máximo disponible abajo: "Cupo: $150 USDC"
- Animación de llenado al cargar (1500ms ease-out)
- Tamaños: sm (200px), md (280px), lg (360px)

También generar:
- ScoreBreakdownCard.tsx — 6 progress bars con label, peso (%) y puntuación
- ScoreBadge.tsx — badge inline con color según riesgo

Props del ScoreGauge:
interface ScoreGaugeProps {
  score: number
  riskLevel: 'high' | 'medium' | 'acceptable' | 'low'
  maxCreditAmount: number
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}
```

---

### P08 — Tabla de Solicitudes Admin
```
Genera la página de gestión de solicitudes de crédito para el admin de Credia.

Archivo: apps/web/app/(admin)/solicitudes/page.tsx

Funcionalidades:
1. Tabla con columnas: Usuario, Score, Monto Solicitado, Plazo, Fecha, Estado, Acciones
2. Filtros: por estado (PENDING/APPROVED/REJECTED), fecha, monto mínimo/máximo
3. Fila expandible al hacer click: muestra ScoreGauge + breakdown + datos del negocio
4. Botones inline: Aprobar (verde) / Rechazar (rojo) para solicitudes PENDING
5. Modal de confirmación antes de aprobar/rechazar con resumen del score
6. Toast notification al aprobar/rechazar
7. Badge de estado con colores (ámbar=pendiente, verde=aprobado, rojo=rechazado)
8. Paginación

Stack: Next.js, Tailwind, Shadcn (Table, Dialog, Badge, Button, Toast).

Datos mock tipados, estructura preparada para fetch con TanStack Query.
Tema oscuro (slate-900/slate-800).
```

---

## ⛓️ DÍA 3 — Blockchain + Deploy

### P09 — Blockchain Service NestJS
```
Genera el módulo blockchain completo para NestJS en Credia.

Archivos:
- packages/api/src/blockchain/blockchain.service.ts
- packages/api/src/blockchain/blockchain.module.ts
- packages/api/src/blockchain/dto/blockchain-response.dto.ts

El servicio debe:
1. Conectarse a Solana devnet con @solana/web3.js
2. Cargar el programa Anchor credia_reputation con su IDL
3. Usar un admin keypair desde variables de entorno
4. Implementar funciones:
   - createReputationProfile(walletAddress, scoreHash) → txSignature
   - registerScoreHash(walletAddress, scoreId, scoreValue) → txSignature
   - registerLoan(walletAddress, loanId, amount, termDays) → txSignature
   - registerPayment(walletAddress, loanId, amount, paymentCount) → txSignature
   - closeLoan(walletAddress, loanId) → txSignature
   - markDefault(walletAddress, loanId) → txSignature
   - getReputationProfile(walletAddress) → UserReputation | null
   - getExplorerUrl(signature) → string

5. generateHash(value: string) → Buffer usando crypto SHA256
6. Manejo de errores con Logger de NestJS
7. Retry logic (3 intentos) para transacciones fallidas

El servicio se integra con:
- scores.service.ts: registra hash cuando se calcula un score
- loans.service.ts: registra crédito cuando se aprueba
- payments.service.ts: registra pago cuando se confirma
```

---

### P10 — Blockchain UI Components
```
Genera los componentes de UI para mostrar información blockchain en Credia.

Stack: Next.js, TypeScript, Tailwind, Lucide React.

Componentes a generar:

1. SolanaVerified.tsx
   - Badge compacto con logo Solana (SVG inline morado #9945FF)
   - Texto "Verificado en Solana"
   - Link al explorador devnet al hacer click
   - Tooltip con hash completo y timestamp
   - Estado: verified (verde) | pending (ámbar pulsante) | error (rojo)

2. BlockchainTimeline.tsx  
   - Timeline vertical de eventos on-chain
   - Cada evento: icono, tipo de evento (en español), timestamp, hash truncado, link explorer
   - Tipos: perfil_creado, score_registrado, crédito_aprobado, pago_registrado, crédito_cerrado, mora_registrada
   - Fondo dark, línea vertical verde

3. TxHashLink.tsx
   - Muestra hash truncado (primeros 8 + ... + últimos 8 chars)
   - Botón copy al portapapeles
   - Link externo al Solana Explorer
   - Tooltip con hash completo

Usar estas URLs del explorer:
- Devnet: https://explorer.solana.com/tx/{hash}?cluster=devnet
- Mainnet: https://explorer.solana.com/tx/{hash}
```

---

### P11 — Dockerfile + Deploy
```
Genera la configuración de deployment completa para Credia.

Archivos a generar:

1. packages/api/Dockerfile (multi-stage)
   - Stage build: Node 20 alpine, instala deps, compila TypeScript
   - Stage prod: solo archivos compilados, usuario no-root, healthcheck

2. apps/web/Dockerfile (multi-stage)
   - Stage deps: instala dependencias
   - Stage build: next build
   - Stage runner: next start en producción

3. infra/docker-compose.prod.yml
   - api: imagen del backend
   - web: imagen del frontend
   - nginx: reverse proxy
   - postgres: PostgreSQL 15
   - redis: Redis 7
   - Con networks, volumes, healthchecks

4. infra/nginx/nginx.conf
   - /api/* → backend:3001
   - /* → frontend:3000
   - Gzip, headers de seguridad

5. infra/fly.toml (para Fly.io)
   - App name: credia-api
   - Region: gru (São Paulo, más cercano a Ecuador)
   - HTTP service en puerto 3001
   - Health check en /health

6. packages/api/src/health/health.controller.ts
   - GET /health → { status: 'ok', timestamp, version }
   - GET /health/db → verifica conexión PostgreSQL
   - GET /health/redis → verifica conexión Redis
```

---

### P12 — Seed de Demo
```
Genera el seed completo de demo para Credia (packages/api/prisma/seed.ts).

Datos a crear:

1. Admin user:
   - email: admin@credia.io
   - password: Admin123!
   - role: ADMIN
   - fullName: Administrador Credia

2. Risk Analyst:
   - email: riesgo@credia.io
   - password: Risk123!
   - role: RISK_ANALYST

3. Usuario demo (trabajadora informal):
   - email: maria@demo.io
   - password: Demo123!
   - fullName: María García Quispe
   - documentNumber: 1712345678
   - phone: +593987654321
   - walletAddress: (generar dirección Solana válida mock)
   - BusinessProfile: negocio "Puesto Mercado Central", tipo VENDOR, ciudad Quito, 3 años activo, $35/día promedio
   - 14 IncomeRecords: ventas diarias de los últimos 14 días, entre $20-50, tipo DAILY_SALES
   - 1 CreditScore: score=642, riskLevel=ACCEPTABLE, maxCreditAmount=150, breakdown completo
   - 1 LoanRequest: APPROVED, $100 USDC, 30 días
   - 1 Loan: ACTIVE, $100 principal + $8 interés, blockchainTx=mock_tx_hash
   - 1 LoanPayment: $54, COMPLETED, paidAt hace 7 días

4. Usuario demo 2 (en mora):
   - email: carlos@demo.io
   - fullName: Carlos Mendoza
   - score=450, crédito DEFAULTED

Usar bcrypt para passwords. Generar con Prisma Client.
Manejar si ya existen los datos (upsert).
```

---

## 🎤 PROMPTS DE PRESENTACIÓN

### P13 — Pitch Text
```
Escribe un pitch de 2 minutos para presentar Credia en una hackathon de Solana.

Contexto:
- Credia da microcréditos a trabajadores informales usando score alternativo
- El score se calcula con ventas, pagos, reputación, sin necesitar banco
- El hash del score y eventos de crédito quedan en Solana (reputación portable)
- Stablecoin: USDC para los desembolsos
- Stack: NestJS + Next.js + Anchor/Solana

Incluir:
- El problema (1 historia específica, persona real imaginaria)
- La solución en 3 pasos simples
- Por qué Solana (velocidad, costo, USDC nativo)
- Diferenciador vs. fintech tradicional
- Métricas del mercado (trabajadores informales en Latinoamérica)
- Call to action

Tono: apasionado, claro, técnico pero accesible.
Máximo 350 palabras.
```

---

## 💡 Tips para Vibe Coding

1. **Sé específico** — El mejor prompt incluye nombres de archivos, interfaces TypeScript exactas y el comportamiento deseado paso a paso.

2. **Da contexto** — Siempre menciona que es Credia, el stack y el módulo al que pertenece.

3. **Pide tipos** — "Incluye interfaces TypeScript" y "usa datos mock tipados" produce código más limpio.

4. **Itera rápido** — Si algo no está bien, pide "Corrige X para que Y. Mantén el resto igual."

5. **Swagger siempre** — Agrega "incluye decoradores Swagger en todos los endpoints" para no olvidarlo.

6. **Un módulo a la vez** — Pide un módulo completo (controller + service + dto) en un prompt. Más eficiente que ir pieza por pieza.

7. **Mock antes de conectar** — Genera UI con datos mock primero, conecta la API después. Más rápido para demo.
