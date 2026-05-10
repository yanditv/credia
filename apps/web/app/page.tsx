import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Store,
  WalletCards,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

const dataSources = [
  { label: 'Ventas diarias', icon: Store },
  { label: 'Pagos', icon: WalletCards },
  { label: 'Facturas', icon: ReceiptText },
  { label: 'Delivery', icon: Smartphone },
  { label: 'Reputacion comercial', icon: BadgeCheck },
  { label: 'Hashes on-chain', icon: Blocks },
];

const flow = [
  'Registra ventas y evidencia',
  'Credia calcula score alternativo',
  'El hash queda verificable en Solana',
  'Accede a microcredito en minutos',
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020604] text-white">
      <section className="relative isolate px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-green-500/20 blur-3xl" />
          <div className="absolute right-[-12rem] top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,214,111,0.16),transparent_28%),linear-gradient(180deg,rgba(2,6,4,0)_0%,#020604_86%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:56px_56px]" />
        </div>

        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
          <BrandLogo priority imageClassName="h-7 sm:h-8" />
          <div className="hidden items-center gap-6 text-sm text-white/60 md:flex">
            <a href="#score" className="hover:text-white">Score</a>
            <a href="#flujo" className="hover:text-white">Flujo</a>
            <a href="#blockchain" className="hover:text-white">On-chain</a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              className="rounded-full bg-[#00d66f] px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_32px_rgba(0,214,111,.35)] transition hover:bg-emerald-300"
            >
              Empezar
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-12 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-sm text-green-200">
              <span className="h-2 w-2 rounded-full bg-[#00d66f] shadow-[0_0_18px_#00d66f]" />
              Credito para informales, verificable en Solana
            </div>

            <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
              Tus ventas diarias ahora cuentan.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Credia transforma pagos, facturas, delivery, movilidad, ventas y reputacion comercial en un score financiero alternativo para desbloquear microcreditos en minutos.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="group inline-flex h-13 items-center justify-center rounded-full bg-[#00d66f] px-7 text-base font-bold text-slate-950 shadow-[0_0_44px_rgba(0,214,111,.32)] transition hover:bg-emerald-300"
              >
                Crear perfil financiero
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-13 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-7 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Ver demo admin
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <Metric value="642" label="score demo" />
              <Metric value="$150" label="cupo USDC" />
              <Metric value="10 min" label="flujo MVP" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-[#00d66f]/10 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-2xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#07110d] p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-sm text-slate-400">Perfil verificable</p>
                    <h2 className="mt-1 text-2xl font-semibold">Maria Garcia</h2>
                  </div>
                  <div className="rounded-full bg-green-400/10 px-3 py-1 text-sm font-medium text-green-300">
                    Riesgo aceptable
                  </div>
                </div>

                <div className="py-7">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Credia Score</p>
                      <p className="mt-2 text-7xl font-semibold tracking-[-0.08em] text-white">642</p>
                    </div>
                    <div className="mb-2 text-right">
                      <p className="text-sm text-slate-400">Cupo</p>
                      <p className="text-3xl font-semibold text-[#00d66f]">150 USDC</p>
                    </div>
                  </div>
                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-[#00d66f] to-emerald-200" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Signal icon={FileCheck2} title="Evidencia" text="Ventas y comprobantes" />
                  <Signal icon={Blocks} title="On-chain" text="Hash registrado" />
                  <Signal icon={Clock3} title="Tiempo" text="Menos de 10 min" />
                  <Signal icon={ShieldCheck} title="Privacidad" text="Sin datos sensibles" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="score" className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00d66f]">La data que los bancos no ven</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Un score construido desde la realidad del trabajo informal.
            </h2>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dataSources.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-green-400/40 hover:bg-green-400/[0.06]">
                  <Icon className="h-7 w-7 text-[#00d66f]" />
                  <p className="mt-8 text-xl font-semibold">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Senales verificables que alimentan un perfil financiero sin historial bancario tradicional.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="flujo" className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00d66f]">Demo hackathon</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Del registro al credito en un solo flujo.
            </h2>
            <p className="mt-5 text-slate-300">
              Maria registra su negocio, sube ventas, genera score y solicita un microcredito de 100 USDC. El admin aprueba y el evento queda verificable.
            </p>
          </div>
          <div className="grid gap-4">
            {flow.map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#020604]/70 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00d66f] font-bold text-slate-950">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold">{step}</p>
                  <p className="text-sm text-slate-400">Paso {index + 1} del acceso a credito verificable.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="blockchain" className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Confianza verificable, privacidad intacta.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Credia no publica nombres, cedulas, telefonos ni ingresos exactos. Solo registra hashes y estados relevantes para que la reputacion sea portable y auditable.
            </p>
          </div>
          <div className="rounded-[2rem] border border-green-400/20 bg-green-400/[0.06] p-6">
            <Blocks className="h-9 w-9 text-[#00d66f]" />
            <p className="mt-8 text-2xl font-semibold">Solana devnet</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Score hash, eventos de credito y pagos quedan como pruebas on-chain para una reputacion financiera portable.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 pt-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-[#00d66f] p-8 text-slate-950 sm:p-12 lg:p-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em]">Credia</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.05em] sm:text-6xl">
                Convierte tus ventas diarias en acceso a credito.
              </h2>
            </div>
            <Link
              href="/registro"
              className="inline-flex h-14 items-center justify-center rounded-full bg-slate-950 px-8 text-base font-bold text-white transition hover:bg-slate-800"
            >
              Probar Credia
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
    </div>
  );
}

function Signal({ icon: Icon, title, text }: { icon: typeof CheckCircle2; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon className="h-5 w-5 text-[#00d66f]" />
      <p className="mt-4 font-semibold">{title}</p>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
