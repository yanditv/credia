# DESIGN.md — Sistema de Diseño Credia

> Guía de diseño completa para la plataforma Credia. Fintech moderno, confiable y accesible para Latinoamérica.

---

## 🎨 Concepto Visual

**Dirección:** Fintech de confianza para el mercado popular latinoamericano.

**Paleta de sentimientos:** Confianza · Claridad · Accesibilidad · Modernidad · Optimismo financiero

**No es:** Banco tradicional frio, cripto especulativo, app genérica.

**Es:** Una herramienta seria que habla el idioma de quienes trabajan duro.

---

## 🎨 Paleta de Colores

### Primarios
```css
--credia-green-50:  #f0fdf4;
--credia-green-100: #dcfce7;
--credia-green-200: #bbf7d0;
--credia-green-300: #86efac;
--credia-green-400: #4ade80;
--credia-green-500: #22c55e;   /* Primary Brand */
--credia-green-600: #16a34a;   /* Primary Dark */
--credia-green-700: #15803d;
--credia-green-800: #166534;
--credia-green-900: #14532d;
```

### Neutros (Slate)
```css
--credia-slate-50:  #f8fafc;
--credia-slate-100: #f1f5f9;
--credia-slate-200: #e2e8f0;
--credia-slate-300: #cbd5e1;
--credia-slate-400: #94a3b8;
--credia-slate-500: #64748b;
--credia-slate-600: #475569;
--credia-slate-700: #334155;
--credia-slate-800: #1e293b;
--credia-slate-900: #0f172a;   /* Background dark */
--credia-slate-950: #020617;
```

### Semánticos
```css
--credia-success:  #22c55e;    /* Verde principal */
--credia-warning:  #f59e0b;    /* Amber — riesgo medio */
--credia-danger:   #ef4444;    /* Red — alto riesgo, mora */
--credia-info:     #3b82f6;    /* Blue — información */
--credia-accent:   #8b5cf6;    /* Purple — blockchain/Solana */
```

### Score Colors
```css
--score-high-risk:    #ef4444;  /* 0-399 */
--score-medium-risk:  #f59e0b;  /* 400-599 */
--score-acceptable:   #3b82f6;  /* 600-749 */
--score-low-risk:     #22c55e;  /* 750-1000 */
```

### Surfaces (modo oscuro — admin panel)
```css
--surface-base:    #0f172a;    /* Fondo principal */
--surface-raised:  #1e293b;    /* Cards, sidebars */
--surface-overlay: #334155;    /* Modals, dropdowns */
--surface-border:  #475569;    /* Bordes sutiles */
```

---

## 🔤 Tipografía

### Fuentes
```css
/* Display / Títulos */
font-family: 'Plus Jakarta Sans', sans-serif;
/* Importar: https://fonts.google.com/specimen/Plus+Jakarta+Sans */

/* Cuerpo / UI */
font-family: 'Inter', sans-serif;
/* Importar: https://fonts.google.com/specimen/Inter */

/* Monospace (scores, código, IDs) */
font-family: 'JetBrains Mono', monospace;
/* Importar: https://fonts.google.com/specimen/JetBrains+Mono */
```

### Escala Tipográfica
```css
/* Display */
.text-display-xl { font-size: 4.5rem; line-height: 1.1; font-weight: 800; }
.text-display-lg { font-size: 3.75rem; line-height: 1.1; font-weight: 800; }
.text-display-md { font-size: 3rem;    line-height: 1.2; font-weight: 700; }

/* Headings */
.text-h1 { font-size: 2.25rem; line-height: 1.3; font-weight: 700; }
.text-h2 { font-size: 1.875rem; line-height: 1.3; font-weight: 600; }
.text-h3 { font-size: 1.5rem;  line-height: 1.4; font-weight: 600; }
.text-h4 { font-size: 1.25rem; line-height: 1.4; font-weight: 600; }

/* Body */
.text-body-lg { font-size: 1.125rem; line-height: 1.7; font-weight: 400; }
.text-body    { font-size: 1rem;     line-height: 1.6; font-weight: 400; }
.text-body-sm { font-size: 0.875rem; line-height: 1.6; font-weight: 400; }

/* UI */
.text-label    { font-size: 0.875rem; line-height: 1; font-weight: 500; letter-spacing: 0.01em; }
.text-caption  { font-size: 0.75rem;  line-height: 1.5; font-weight: 400; }
.text-overline { font-size: 0.75rem;  line-height: 1; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }

/* Score / Datos */
.text-score-xl { font-size: 5rem; font-family: JetBrains Mono; font-weight: 700; }
.text-score-lg { font-size: 3rem; font-family: JetBrains Mono; font-weight: 700; }
.text-amount   { font-size: 2rem; font-family: JetBrains Mono; font-weight: 600; }
```

---

## 📐 Espaciado

Basado en múltiplos de 4px (sistema de 4pt grid):

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

---

## 🔘 Componentes UI

### Score Gauge
```tsx
// Componente gauge circular para mostrar el score
// Color dinámico según nivel de riesgo
// Animación de llenado al cargar
// Número central en JetBrains Mono

<ScoreGauge 
  score={620}              // 0-1000
  riskLevel="acceptable"   // high | medium | acceptable | low
  maxAmount={150}          // cupo en USD
  animated={true}
/>
```

**Estados visuales:**
- `0-399` → rojo `#ef4444`, etiqueta "Alto Riesgo"
- `400-599` → ámbar `#f59e0b`, etiqueta "Riesgo Medio"
- `600-749` → azul `#3b82f6`, etiqueta "Riesgo Aceptable"
- `750-1000` → verde `#22c55e`, etiqueta "Bajo Riesgo"

---

### Score Breakdown Card
```tsx
// Muestra los 6 componentes del score como barras de progreso
// Con porcentaje y puntuación de cada componente

const components = [
  { label: "Historial de Pagos",    weight: 30, score: 85 },
  { label: "Ventas Constantes",     weight: 25, score: 72 },
  { label: "Reputación Comercial",  weight: 15, score: 60 },
  { label: "Comportamiento de Uso", weight: 10, score: 90 },
  { label: "Documentación",         weight: 10, score: 80 },
  { label: "Antigüedad del Negocio",weight: 10, score: 50 },
]
```

---

### Metric Card
```tsx
// Card compacta con icono, valor y tendencia
<MetricCard
  title="Total Prestado"
  value="$4,250"
  currency="USDC"
  trend={{ value: 12, direction: "up" }}
  icon={<DollarSign />}
  color="green"
/>
```

**Variantes:** `green | amber | red | blue | purple`

---

### Status Badge
```tsx
// Badge para estados de créditos, usuarios, solicitudes
<StatusBadge status="active" />    // Verde
<StatusBadge status="pending" />   // Ámbar
<StatusBadge status="rejected" />  // Rojo
<StatusBadge status="paid" />      // Azul
<StatusBadge status="defaulted" /> // Rojo oscuro
```

---

### Blockchain Event Timeline
```tsx
// Timeline vertical de eventos on-chain
// Con icono de Solana y link a explorer
<BlockchainTimeline events={[
  { type: "score_registered", tx: "5xK...", timestamp: "2024-01-15" },
  { type: "loan_created", tx: "3mJ...", timestamp: "2024-01-15" },
  { type: "payment_registered", tx: "9pQ...", timestamp: "2024-01-22" },
]} />
```

---

### Loan Progress Bar
```tsx
// Barra de progreso de pago del crédito
// Muestra cuotas pagadas vs total
<LoanProgress 
  totalAmount={100}
  paidAmount={45}
  termDays={30}
  daysElapsed={13}
/>
```

---

## 🖥️ Layout Admin Panel

### Sidebar (280px)
```
┌─────────────────────┐
│  🟢 CREDIA          │  Logo + wordmark
├─────────────────────┤
│  Dashboard          │  Icono + label activo
│  Usuarios           │
│  Solicitudes   (3)  │  Badge con pendientes
│  Créditos Activos   │
│  Pagos              │
│  Mora               │
│  Reportes           │
├─────────────────────┤
│  Auditoría          │  Separador
├─────────────────────┤
│  ● Admin User       │  Avatar + nombre
│  Cerrar sesión      │
└─────────────────────┘
```

**Colores sidebar:**
- Fondo: `slate-900` (#0f172a)
- Ítem activo: bg `green-500/10`, text `green-400`, borde izq `green-500`
- Ítem hover: bg `slate-800`
- Texto: `slate-400` normal, `white` activo

---

### Dashboard Principal
```
┌─────────────────────────────────────────────────────┐
│  Buenos días, Admin ☀️          Mayo 2024           │
├──────────┬──────────┬──────────┬────────────────────┤
│  Total   │  Total   │  % Mora  │  Score             │
│ Prestado │Recuperado│          │  Promedio          │
│  $4,250  │  $3,100  │  2.3%    │  642               │
│  USDC    │  USDC    │          │  Aceptable         │
├──────────┴──────────┴──────────┴────────────────────┤
│  Créditos desembolsados (últimos 30 días) [Recharts]│
│  ████████████████░░░░░░░░░░                         │
├─────────────────────┬───────────────────────────────┤
│  Últimas solicitudes│  Créditos en mora             │
│  [Tabla 5 filas]    │  [Lista 3 items]              │
└─────────────────────┴───────────────────────────────┘
```

---

## 📱 Pantallas Clave

### 1. Login
- Fondo: gradient `from-slate-950 via-slate-900 to-green-950`
- Logo centrado grande
- Card glassmorphism con form
- Slogan: *"Convierte tus ventas en crédito"*

### 2. Dashboard Metrics
- Grid 4 columnas (métricas top)
- Gráfico línea (tendencia 30 días)
- Tabla solicitudes pendientes
- Mini-map de usuarios por ciudad (opcional)

### 3. Perfil de Usuario (Admin View)
- Header con foto/avatar, nombre, estado badge
- Score gauge grande (prominente)
- Tabs: Ingresos | Créditos | Historial Blockchain
- Timeline de eventos

### 4. Score Detail
- Score gauge animado (center)
- Breakdown de 6 componentes con barras
- Explicación en lenguaje simple
- Historial de scores previos
- Hash de Solana con link a explorer
- Botón "Recalcular"

### 5. Solicitudes de Crédito
- Tabla con filtros (status, fecha, monto)
- Fila expandible con detalle rápido
- Botones Aprobar/Rechazar inline
- Modal de confirmación con score resumen

### 6. Panel de Mora
- KPIs: % mora, monto en riesgo, usuarios afectados
- Lista usuarios en mora con días de atraso
- Acciones: enviar alerta, registrar acuerdo

---

## 🏷️ Iconografía

Usar **Lucide React** como biblioteca base:

```tsx
// Módulos clave → Iconos
Dashboard     → LayoutDashboard
Usuarios      → Users
Solicitudes   → FileText
Créditos      → CreditCard
Pagos         → Wallet
Mora          → AlertTriangle
Reportes      → BarChart3
Auditoría     → Shield
Score         → TrendingUp
Blockchain    → Link (o Cpu)
Aprobado      → CheckCircle2 (green)
Rechazado     → XCircle (red)
Pendiente     → Clock (amber)
Mora          → AlertCircle (red)
USDC          → DollarSign (con badge azul)
Solana        → [SVG custom logo]
```

---

## ✨ Microinteracciones

### Hover States
- Cards: `scale(1.01)` + `shadow-lg` + border color change
- Botones: 150ms ease transition
- Table rows: bg highlight `slate-800/50`

### Loading States
- Score calculando: gauge con animación pulsante + skeleton
- Tablas: skeleton rows con shimmer
- Blockchain tx: spinner + "Registrando en Solana..."

### Transiciones de página
- `fade + slide-up` en 200ms
- Next.js page transitions con `AnimatePresence` (Framer Motion)

### Score Animation
- Al cargar un score: gauge llena progresivamente desde 0
- Duración: 1500ms con `ease-out`
- Número incrementa al mismo tiempo

---

## 🟢 Indicadores Blockchain

Cuando un dato está registrado en Solana, mostrar:

```tsx
<SolanaVerified 
  txHash="5xKj..." 
  network="devnet"
  label="Verificado en Solana"
/>
// → Badge verde pequeño con logo Solana + link a explorer
// → Tooltip con hash completo y timestamp
```

**Colores:**
- Verificado: `#9945FF` (morado Solana) con check verde
- Pendiente: `amber-400` pulsante
- Error: `red-400`

---

## 📊 Gráficos (Recharts)

### Configuración base
```tsx
const chartColors = {
  primary: '#22c55e',   // verde credia
  secondary: '#3b82f6', // azul
  warning: '#f59e0b',   // ámbar
  danger: '#ef4444',    // rojo
  grid: '#334155',      // grid lines dark
  text: '#94a3b8',      // labels
}

// Tooltip custom con fondo slate-800, border slate-600
// Sin tooltip default de recharts
```

### Gráficos a implementar
1. **LineChart** — Créditos desembolsados por día (30 días)
2. **BarChart** — Distribución de scores (rangos)
3. **PieChart** — Estado de cartera (activos/pagados/mora)
4. **AreaChart** — Ingresos registrados por usuario (trends)
5. **RadialBarChart** — Score gauge (componente principal)

---

## 📐 Breakpoints Responsive

```css
/* Tailwind defaults */
sm:  640px   /* Tablet pequeño */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop pequeño */
xl:  1280px  /* Desktop */
2xl: 1536px  /* Desktop grande */

/* Admin panel: mínimo 1024px (dashboard) */
/* Landing: completamente responsive desde 375px */
```

---

## 🚀 Landing Page (si hay tiempo)

### Hero Section
```
Headline: "Tu historial financiero,
           aunque no tengas banco."

Sub: "Credia convierte tus ventas diarias en
     acceso a crédito. Sin burocracia."

CTA: [Solicita tu Crédito] [Ver cómo funciona]
```

### Secciones
1. Hero con ilustración/mockup
2. "¿Quién puede usar Credia?" (íconos: vendedor, repartidor, taxista...)
3. Cómo funciona (3 pasos)
4. Score explicado (visual)
5. Blockchain = transparencia (sin tecnicismos)
6. Testimonios (mock para hackathon)
7. CTA final

### Colores Landing
- Fondo: `white` (contrasta con admin oscuro)
- Acento: `green-500` y `green-600`
- Texto: `slate-900`

---

## 🎯 Guía de Tono Visual

| Contexto | Tono | Ejemplo |
|----------|------|---------|
| Score alto (750+) | Celebratorio, verde | "¡Excelente! Tienes bajo riesgo" |
| Score medio (400-599) | Alentador, ámbar | "Vas bien, sigue registrando ventas" |
| Score bajo (<400) | Empático, no punitivo | "Aún puedes mejorar tu score" |
| Crédito aprobado | Festivo | Confetti + pantalla verde |
| Mora | Urgente, no agresivo | Banner ámbar con opción de pago |
| Blockchain confirmado | Técnico + confiable | "Registrado permanentemente en Solana" |

---

## 📦 Shadcn Components a Instalar

```bash
# Shadcn con Next.js 16 / React 19 / Tailwind v4
npx shadcn@latest init

npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add progress
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add alert
npx shadcn@latest add alert-dialog
```

### Configuración Shadcn (components.json)
```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  }
}
```

### Tailwind v4 — globals.css
```css
/* No necesita tailwind.config.js */
@import "tailwindcss";

/* Definir colores Credia en @theme */
@theme {
  --color-credia-green-500: #22c55e;
  --color-credia-green-600: #16a34a;
  --color-surface-base: #0f172a;
  --color-surface-raised: #1e293b;
  --color-surface-overlay: #334155;
  --color-surface-border: #475569;
  
  /* Fuentes */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```
