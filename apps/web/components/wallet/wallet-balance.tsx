'use client';

import { useQuery } from '@tanstack/react-query';
import { Coins, RefreshCw } from 'lucide-react';
import { balanceApi, type WalletBalance } from '@/lib/api/balance';

interface WalletBalanceCardProps {
  // Cuál endpoint pegar
  source: 'me' | 'treasury';
  // Render compacto (badge en topbar) vs ampliado (card en /mi-perfil)
  variant?: 'compact' | 'full';
  // Etiqueta para el badge (ej. "Treasury", "Tu wallet"). Si no, default por source.
  label?: string;
}

export function WalletBalanceCard({ source, variant = 'full', label }: WalletBalanceCardProps) {
  const query = useQuery({
    queryKey: ['wallet-balance', source],
    queryFn: () => (source === 'me' ? balanceApi.getMyWallet() : balanceApi.getTreasury()),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const heading = label ?? (source === 'me' ? 'Saldos on-chain' : 'Treasury');

  if (variant === 'compact') {
    return <CompactBadge query={query} heading={heading} />;
  }

  return <FullCard query={query} heading={heading} />;
}

function CompactBadge({
  query,
  heading,
}: {
  query: ReturnType<typeof useQuery<WalletBalance, Error>>;
  heading: string;
}) {
  if (query.isLoading) {
    return (
      <span className="hidden items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs text-slate-400 sm:inline-flex">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {heading}…
      </span>
    );
  }

  if (query.error || !query.data) {
    return null; // hide silently on error to avoid noise in topbar
  }

  return (
    <button
      type="button"
      onClick={() => query.refetch()}
      title="Click para refrescar"
      className="hidden items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs sm:inline-flex"
    >
      <Coins className="h-3.5 w-3.5 text-amber-400" />
      <span className="text-slate-400">{heading}</span>
      <span className="font-mono text-slate-100">
        {query.data.sol.ui} <span className="text-slate-500">SOL</span>
      </span>
      <span className="text-slate-700">·</span>
      <span className="font-mono text-green-300">
        {query.data.usdc.ui} <span className="text-slate-500">USDC</span>
      </span>
    </button>
  );
}

function FullCard({
  query,
  heading,
}: {
  query: ReturnType<typeof useQuery<WalletBalance, Error>>;
  heading: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-slate-500">{heading}</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          aria-label="Refrescar saldos"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={query.isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {query.isLoading ? (
        <p className="text-sm text-slate-500">Consultando RPC…</p>
      ) : query.error ? (
        <p className="text-sm text-red-300">{query.error.message}</p>
      ) : query.data ? (
        <div className="grid grid-cols-2 gap-3">
          <BalanceItem
            label="SOL"
            value={query.data.sol.ui}
            color="text-slate-100"
            sub="para fees de tx"
          />
          <BalanceItem
            label="USDC"
            value={query.data.usdc.ui}
            color="text-green-400"
            sub={query.data.usdc.ui === '0.00' ? 'sin fondos aún' : 'disponible'}
          />
        </div>
      ) : null}
    </div>
  );
}

function BalanceItem({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  sub: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono text-2xl font-bold tabular-nums ${color}`}>{value}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
