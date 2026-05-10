'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Wallet, Hash, Receipt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddressLink } from './address-link';
import { TransactionLink } from './transaction-link';
import { loansApi } from '@/lib/api/loans';
import { useAuthStore } from '@/lib/auth-store';
import type { CreditScore, Loan, LoanStatus } from '@/lib/api-types';

interface OnchainReputationCardProps {
  score: CreditScore;
}

const LOAN_STATUS_TONE: Record<LoanStatus, 'green' | 'amber' | 'red' | 'slate'> = {
  PAID: 'green',
  ACTIVE: 'amber',
  DEFAULTED: 'red',
  CANCELLED: 'slate',
};

export function OnchainReputationCard({ score }: OnchainReputationCardProps) {
  const walletAddress = useAuthStore((s) => s.user?.walletAddress);
  const [showLoans, setShowLoans] = useState(false);

  const loansQuery = useQuery({
    queryKey: ['loans', 'me'],
    queryFn: () => loansApi.listMine(),
  });

  const loans: Loan[] = loansQuery.data ?? [];
  const loansOnChain = loans.filter((l) => Boolean(l.blockchainTx));
  const counts = {
    total: loans.length,
    active: loans.filter((l) => l.status === 'ACTIVE').length,
    paid: loans.filter((l) => l.status === 'PAID').length,
    defaulted: loans.filter((l) => l.status === 'DEFAULTED').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <CardTitle>Reputación on-chain</CardTitle>
            <CardDescription>
              Pruebas verificables registradas en Solana devnet
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Row
            icon={Wallet}
            label="Wallet"
            value={
              walletAddress ? (
                <AddressLink address={walletAddress} />
              ) : (
                <span className="text-xs text-slate-500">Sin vincular</span>
              )
            }
          />

          <Row
            icon={Hash}
            label="Hash del score"
            value={
              <span className="inline-flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-300">
                  {score.scoreHash.slice(0, 10)}…{score.scoreHash.slice(-6)}
                </span>
                {score.blockchainTx ? (
                  <span className="text-slate-500">·</span>
                ) : null}
                {score.blockchainTx ? (
                  <TransactionLink signature={score.blockchainTx} />
                ) : (
                  <span className="text-xs text-slate-500">Sin tx</span>
                )}
              </span>
            }
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">Créditos registrados</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="slate">{counts.total} total</Badge>
              {counts.active > 0 ? <Badge tone="amber">{counts.active} activos</Badge> : null}
              {counts.paid > 0 ? <Badge tone="green">{counts.paid} pagados</Badge> : null}
              {counts.defaulted > 0 ? <Badge tone="red">{counts.defaulted} mora</Badge> : null}
            </div>
          </div>

          {loansOnChain.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowLoans((s) => !s)}
              className="mt-3 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              {showLoans ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showLoans ? 'Ocultar' : 'Ver'} {loansOnChain.length} tx{loansOnChain.length === 1 ? '' : 's'} on-chain
            </button>
          ) : null}

          {showLoans && loansOnChain.length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-slate-800 pt-3">
              {loansOnChain.map((loan) => (
                <li key={loan.id} className="flex items-center justify-between gap-2 text-xs">
                  <Badge tone={LOAN_STATUS_TONE[loan.status]}>{loan.status}</Badge>
                  {loan.blockchainTx ? <TransactionLink signature={loan.blockchainTx} /> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <p className="text-xs text-slate-500">
          La trazabilidad pública en blockchain te permite construir reputación crediticia
          sin depender de un buró tradicional. Los hashes evitan exponer datos personales.
        </p>
      </CardContent>
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1.5">{value}</div>
    </div>
  );
}
