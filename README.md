# 🟢 Credia — Microcréditos Inteligentes para Informales

> *"Convierte tus ventas diarias en acceso a crédito."*

Plataforma fintech que genera un **score financiero alternativo** para trabajadores informales usando ventas, pagos, facturas, reputación comercial e historial de cumplimiento — sin requerir cuenta bancaria.

---

## 🌎 Contexto

Millones de trabajadores informales en Latinoamérica tienen actividad económica real pero son invisibles para el sistema financiero tradicional. Credia les da identidad financiera verificable usando sus propios datos de negocio, con reputación portable registrada en Solana.

---

## ✨ Features

- **Score alternativo** — 6 componentes (ventas, pagos, reputación, antigüedad, docs, comportamiento)
- **Microcréditos en USDC** — hasta $300 según score, plazos de 7/15/30 días
- **Reputación on-chain** — hashes verificables en Solana Devnet
- **Panel admin** — aprobación, monitoreo de cartera, gestión de mora
- **Flujo completo** — registro → score → crédito → pago → reputación mejorada

---

## 🏗️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16.2, Tailwind CSS v4, Shadcn/ui, React 19.2 |
| Backend | NestJS 11, PostgreSQL 16, Prisma 6, Redis 7 |
| Blockchain | Solana, Anchor 0.31, USDC |
| Wallets | Phantom, Solflare |
| Infra | Docker, Cloudflare, Fly.io |

---

## 🚀 Quick Start

### Pre-requisitos
- Node.js 20+
- Docker & Docker Compose
- Rust + Anchor CLI (para blockchain)
- Solana CLI

### 1. Clonar y configurar

```bash
git clone https://github.com/tu-org/credia.git
cd credia

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

### 2. Levantar infraestructura

```bash
# PostgreSQL + Redis + MinIO
docker-compose up -d

# Verificar que todo esté corriendo
docker-compose ps
```

### 3. Backend (NestJS)

```bash
cd packages/api

# Ejecutar migraciones
npx prisma migrate dev

# Seed inicial (admin user + datos demo)
npx prisma db seed

# Iniciar en desarrollo
npm run start:dev
```

API disponible en: `http://localhost:3001`
Swagger docs: `http://localhost:3001/api`

### 4. Frontend (Next.js 16)

```bash
cd apps/web
npm run dev  # Turbopack activo por defecto (~400% más rápido que webpack)
```

Admin panel: `http://localhost:3000`

### 5. Blockchain (Solana)

```bash
cd packages/blockchain/credia_reputation

# Configurar devnet
solana config set --url devnet
solana airdrop 2

# Build y deploy
anchor build
anchor deploy

# Copiar Program ID a .env
echo "SOLANA_PROGRAM_ID=<program-id>" >> ../../.env
```

---

## 📁 Estructura del Proyecto

```
credia/
├── apps/
│   └── web/              # Next.js admin panel + landing
├── packages/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── business-profiles/
│   │   │   ├── income-records/
│   │   │   ├── scores/
│   │   │   ├── loan-requests/
│   │   │   ├── loans/
│   │   │   ├── payments/
│   │   │   ├── blockchain/
│   │   │   └── audit/
│   │   └── prisma/
│   └── blockchain/
│       └── credia_reputation/  # Anchor program
├── infra/
│   └── docker-compose.yml
└── docs/
    ├── CLAUDE.md
    ├── DESIGN.md
    ├── BLOCKCHAIN.md
    └── SPRINT_PLAN.md
```

---

## 🎯 Demo Flow

1. **Admin login** → `admin@credia.io` / `Admin123!`
2. **Usuario demo** → María García, vendedora de mercado, Quito
3. **Score calculado** → 642/1000, Riesgo Aceptable, cupo $150 USDC
4. **Solicitud aprobada** → $100 USDC a 30 días
5. **Hash on-chain** → [Ver en Solana Explorer →](https://explorer.solana.com/?cluster=devnet)
6. **Pago registrado** → reputación mejora on-chain

---

## 🔐 Credenciales Demo

```
Admin:        admin@credia.io / Admin123!
Usuario demo: maria@demo.io / Demo123!
Wallet demo:  7xK...abc (Phantom devnet)
```

---

## 📊 Score Formula

```
Score (0-1000) =
  Historial de pagos        × 30%
  Ventas constantes         × 25%
  Reputación comercial      × 15%
  Comportamiento de uso     × 10%
  Documentación verificada  × 10%
  Antigüedad del negocio    × 10%

Cupos:
  < 400    → No aprobado
  400-599  → hasta $50 USDC
  600-749  → hasta $150 USDC
  750-1000 → hasta $300 USDC
```

---

## ⛓️ Blockchain

El programa `credia_reputation` en Solana registra:
- Hash del score (SHA256, inmutable)
- Estado del crédito (activo/pagado/mora)
- Eventos de pago verificables
- Reputación portable del usuario

**Solo hashes y estados — nunca datos personales.**

---

## 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| [CLAUDE.md](docs/CLAUDE.md) | Guía para vibe coding con IA |
| [DESIGN.md](docs/DESIGN.md) | Sistema de diseño completo |
| [BLOCKCHAIN.md](docs/BLOCKCHAIN.md) | Integración Solana/Anchor |
| [SPRINT_PLAN.md](docs/SPRINT_PLAN.md) | Plan de sprint y roadmap |
| [Swagger](http://localhost:3001/api) | API REST documentada |

---

## 🌐 Deployment

```bash
# Producción con Docker
docker-compose -f infra/docker-compose.prod.yml up -d

# Fly.io
fly deploy --config infra/fly.toml

# Variables de entorno en producción
# Ver .env.example para lista completa
```

---

## ⚖️ Legal

> Los intereses y plazos del MVP son aproximaciones para validación. **Deben ser revisados por asesor legal antes de operar en producción.** Ecuador cuenta con Ley Fintech y sandbox regulatorio — se recomienda consultar con la Junta de Política y Regulación Financiera.

---

## 👥 Equipo

| Miembro | Rol | Ubicación | Stack |
|---------|-----|-----------|-------|
| **Sebastian Jara** *(lead)* | Fullstack | Cuenca, ECU | JavaScript · Python · Java |
| **Cesar Puma** | Fullstack | Cuenca, ECU | JavaScript · TypeScript · Python · Java · C/C++ |
| **Daniel Gualán** | Blockchain | Cuenca, ECU | — |
| **Junior Leonardo Wachapa Yankur** | Fullstack | Cuenca, ECU | Python · Java · JavaScript · TypeScript |

**Network:** Solana Devnet
**Track:** DeFi / Financial Inclusion

---

*Credia — Identidad financiera para quienes trabajan duro.*
