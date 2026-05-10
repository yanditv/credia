# CONTRIBUTING.md — Reglas de colaboración Credia

> Este archivo es la **fuente de verdad** del flujo de trabajo del equipo.
> Lo deben respetar tanto los desarrolladores como los asistentes de IA (Claude, Cursor, Copilot).
> Para stack, arquitectura y modelos de datos ver [CLAUDE.md](CLAUDE.md).

---

## ⚡ TL;DR

1. Cortar rama desde `develop` actualizado.
2. Una rama = una tarea. Nombrarla `feat/<area>/<desc>`.
3. Commits en español, formato Conventional Commits.
4. PR contra `develop`, mínimo 1 review.
5. **Nunca** push directo a `main` o `develop`.
6. **Nunca** commitear `.env`, secretos, keypairs, o datos personales.

---

## 👥 Equipo y áreas de propiedad

| Dev | Rol | Áreas que owna | Reviewer natural |
|---|---|---|---|
| **Sebastian Jara** *(lead)* | Fullstack | `infra`, `web`, deploy, arquitectura | — (es el lead) |
| **Cesar Puma** | Fullstack | `api` (auth, scoring, income), `db` | Sebastián / Junior |
| **Daniel Gualán** | Blockchain | `blockchain` (Anchor, Solana service) | Sebastián |
| **Junior Wachapa Yankur** | Fullstack | `api` (loans, payments), `web` (loan flow, blockchain UI) | Sebastián / Cesar |

> **Regla:** trabajo de blockchain (Anchor / `@solana/web3.js` / hashes on-chain) lo aprueba Daniel. Cambios de arquitectura o merges a `main` los aprueba Sebastián.

---

## 🌳 Modelo de ramas

```
main      ← producción / release (protegida)
  └─ develop                ← integración diaria (protegida)
       ├─ feat/<area>/<desc>   ← nuevas features
       ├─ fix/<area>/<desc>    ← bugs
       ├─ chore/<area>/<desc>  ← infra, configs, deps
       └─ docs/<area>/<desc>   ← documentación
```

### Áreas válidas
`setup` · `db` · `api` · `web` · `blockchain` · `infra` · `deps` · `docs`

### Naming
```
feat/api/income-records
feat/web/score-gauge
fix/blockchain/account-size
chore/deps/bump-prisma
docs/api/swagger-examples
```

### Reglas de rama
- Siempre cortar desde `develop` actualizado (`git pull origin develop` antes).
- Una rama = una tarea pequeña (idealmente <300 líneas de diff, <2 días de vida).
- Sin commits directos a `main` ni a `develop`. Solo merges vía PR.
- Borrar la rama local y remota después de mergear.

---

## 📝 Commits — Conventional Commits

```
<tipo>(<scope>): <descripción en imperativo>

[cuerpo opcional explicando el porqué]

[footer opcional: refs, breaking changes]
```

### Tipos permitidos
`feat` · `fix` · `refactor` · `docs` · `chore` · `test` · `perf` · `style`

### Scopes válidos
`api` · `web` · `db` · `blockchain` · `infra` · `deps` · `auth` · `scoring` · `loans`

### Reglas
- Idioma: **español**, en imperativo (`agrega`, `corrige`, no `agregado`).
- Una idea por commit. Si un PR tiene 8 commits "WIP", se hace squash al mergear.
- Sin commits con `console.log` o `print` de debug.

### Ejemplos
```
feat(api): agrega endpoint POST /scores/calculate
fix(blockchain): corrige tamaño de cuenta UserReputation
refactor(web): extrae ScoreGauge a componente reusable
chore(deps): actualiza prisma a 6.2.1
docs(api): completa swagger de loan-requests
```

---

## 🔀 Pull Requests

### Reglas
- **Base:** `develop` (nunca `main` directamente excepto en releases).
- **Reviewers:** 1 mínimo, según tabla de propiedad.
- **Título:** mismo formato que el commit principal.
- **Descripción debe incluir:**
  - Qué hace y por qué.
  - Cómo probarlo (pasos concretos).
  - Screenshots si toca UI.
  - Endpoints o tx hashes si aplica.
- **CI verde** antes de mergear (lint + typecheck + tests).
- **Merge strategy:** squash & merge a `develop`.

### Checklist antes de pedir review
- [ ] `npm run lint` sin errores.
- [ ] `tsc --noEmit` pasa.
- [ ] Variables nuevas agregadas a `.env.example`.
- [ ] Swagger actualizado si tocaste endpoints.
- [ ] Sin `.env`, keypairs ni secretos en el diff.
- [ ] Sin datos personales reales en seeds.

---

## 🚫 Prohibido commitear

- `.env`, `.env.local`, `.env.production` (cualquier `.env` con valores reales).
- Keypairs de Solana: `id.json`, `*-keypair.json`, `admin-wallet.json`.
- `node_modules/`, `dist/`, `target/`, `.next/`, `.anchor/`, `test-ledger/`.
- Datos personales reales: cédulas, teléfonos, emails de usuarios reales.
- `console.log`, `console.debug`, `print(...)` de debug.
- Imports comentados o código muerto "por si acaso".

---

## 📦 Skills de IA (.agents/skills/)

El directorio `.agents/skills/` contiene skills de IA que mejoran la asistencia durante el desarrollo.

### Reglas

- **Skills oficiales y verificadas:** Solo se commitean skills de fuentes oficiales con licencia clara (MIT, Apache-2.0). Ej: `solana-dev` de Solana Foundation.
- **skills-lock.json:** Se versiona junto con los skills. Mantiene el hash SHA256 de cada skill para verificar integridad.
- **Actualización:** Cada skill se actualiza vía `npx skills add <source>` en su propia rama siguiendo el flujo de PR estándar.
- **Propietario:** El mantenedor del área correspondiente revisa los cambios (ej: blockchain → Daniel Gualán).
- **No mezclar:** Un PR de skill no debe tocar código fuente. Solo archivos bajo `.agents/skills/` y `skills-lock.json`.

### Qué skills entran

Skills críticas para el stack del proyecto (Solana, Anchor, blockchain). Skills de propósito general o experimentales se instalan localmente por cada dev.

---

## 🤖 Reglas para asistentes de IA (Claude, Cursor, Copilot)

Cuando uses vibe coding, el asistente debe respetar lo siguiente. Si genera algo que rompa estas reglas, **rechazar y regenerar** corrigiendo.

### Stack — fijo, no proponer alternativas sin justificación
- NestJS 11 (no Express, no Fastify standalone).
- Next.js **16** App Router con Turbopack (no Pages Router, no Vite).
- Tailwind **v4** con `@import "tailwindcss"` en `globals.css`. **NO crear `tailwind.config.js`**.
- React **19.2** (Server Actions, `use()` hook, `useOptimistic`).
- Prisma 6, PostgreSQL 16.
- Anchor 0.31, `@solana/web3.js v2`.

### Reglas de código

1. **Next.js 16:** `params` y `searchParams` son **async**. Siempre `await` antes de leerlos.
2. **TypeScript strict.** Sin `any`. Si no se conoce el tipo, definir interface o usar `unknown`.
3. **NestJS endpoints:** todos con `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth` cuando corresponda.
4. **Rutas protegidas:** `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` cuando aplique.
5. **DTOs:** validar con `class-validator` (`@IsString`, `@IsEmail`, `@IsDecimal`, etc.).
6. **Errores al usuario:** `HttpException` con mensaje en español.
7. **Variables sensibles:** vía `@nestjs/config`, **nunca** hardcodeadas.
8. **Cada módulo NestJS:** carpeta propia con `controller`, `service`, `module`, `dto/`.
9. **Frontend:** componentes en `components/`, hooks en `hooks/`, tipos compartidos en `packages/shared`.
10. **Estado global frontend:** Zustand. Server state: TanStack Query.

### Reglas críticas de blockchain

🚫 **NUNCA poner en Solana:**
- Nombre, cédula/RUC, email, teléfono.
- Dirección física.
- Ingresos exactos en USD.
- Cualquier documento privado.

✅ **Solo en Solana:**
- Hashes (SHA256) de score, documentos, consentimientos.
- Estados de crédito (`active`, `paid`, `defaulted`).
- Timestamps de eventos.
- Wallet addresses (públicas por definición).

### Cómo invocar IA en este repo

- Antes de pedir código complejo, asegurarse que el asistente **leyó `CLAUDE.md`**.
- Para módulos NestJS y componentes React, usar los prompts de [PROMPTS.md](PROMPTS.md).
- Si el asistente no respeta el stack, recordarle: *"Stack fijo en CLAUDE.md, no propongas alternativas."*

---

## 🆘 Cheatsheet de comandos

### Empezar tarea nueva
```bash
git checkout develop
git pull origin develop
git checkout -b feat/api/income-records
```

### Subir y abrir PR
```bash
git push -u origin feat/api/income-records
gh pr create --base develop --title "feat(api): agrega módulo income-records"
```

### Después del merge
```bash
git checkout develop
git pull origin develop
git branch -d feat/api/income-records
git push origin --delete feat/api/income-records
```

### Sincronizar rama con develop (si quedó atrasada)
```bash
git checkout feat/api/income-records
git fetch origin
git rebase origin/develop
# resolver conflictos si los hay
git push --force-with-lease
```

---

## 📚 Referencias

| Archivo | Para qué |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Stack, modelos de datos, endpoints, reglas para IA |
| [SPRINT_PLAN.md](SPRINT_PLAN.md) | Plan diario y tareas por bloque |
| [DESIGN.md](DESIGN.md) | Sistema de diseño y componentes |
| [PROMPTS.md](PROMPTS.md) | Prompts curados para vibe coding |
| [README.md](README.md) | Quick start del proyecto |
