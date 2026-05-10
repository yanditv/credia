'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FileCheck2, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonTable } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { LoanRequestForm } from '@/components/loans/loan-request-form';
import { LoanRequestsTable } from '@/components/loans/loan-requests-table';
import { loanRequestsApi } from '@/lib/api/loan-requests';
import { scoresApi } from '@/lib/api/scores';
import { formatUsdc } from '@/lib/format';
import { useAuthStore } from '@/lib/auth-store';

export default function SolicitarCreditoPage() {
  const walletAddress = useAuthStore((s) => s.user?.walletAddress);

  const requestsQuery = useQuery({
    queryKey: ['loan-requests', 'me'],
    queryFn: () => loanRequestsApi.listMine(),
  });

  const scoreQuery = useQuery({
    queryKey: ['scores', 'me', 'latest'],
    queryFn: () => scoresApi.getLatest(),
  });

  const maxAmount = scoreQuery.data?.maxCreditAmount;
  const hasWallet = Boolean(walletAddress);
  const canRequest = scoreQuery.data && scoreQuery.data.score >= 400 && hasWallet;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Solicitar crédito</h1>
        <p className="mt-1 text-sm text-slate-400">
          Pedí un microcrédito hasta tu cupo aprobado
        </p>
      </div>

      {scoreQuery.data ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Tu cupo aprobado</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-green-400">
                {formatUsdc(maxAmount ?? '0')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500">Score actual</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-slate-100">
                {scoreQuery.data.score}<span className="text-sm text-slate-500">/1000</span>
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {canRequest ? (
        <Card>
          <CardHeader>
            <CardTitle>Nueva solicitud</CardTitle>
            <CardDescription>
              El monto se valida contra tu cupo. Plazos disponibles: 7, 15 o 30 días.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoanRequestForm />
          </CardContent>
        </Card>
      ) : !scoreQuery.isLoading ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            {scoreQuery.data && scoreQuery.data.score < 400 ? (
              <p className="text-sm text-slate-300">
                Tu score aún no califica para crédito (mínimo 400). Seguí registrando ventas para mejorarlo.
              </p>
            ) : !scoreQuery.data ? (
              <p className="text-sm text-slate-300">
                Necesitás calcular tu score primero. Andá a &quot;Mi score&quot; y tocá &quot;Calcular ahora&quot;.
              </p>
            ) : !hasWallet ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                    <Wallet className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-200">
                      Vinculá una wallet Solana antes de solicitar crédito
                    </p>
                    <p className="text-xs text-slate-400">
                      El desembolso de USDC se hace on-chain a la dirección que vincules en tu perfil. Sin wallet, no tenemos a dónde mandarte los fondos.
                    </p>
                  </div>
                </div>
                <Link
                  href="/mi-perfil"
                  className="inline-flex h-8 items-center justify-center gap-2 self-start rounded-lg bg-green-500 px-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  Ir a vincular wallet
                </Link>
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Tus solicitudes
        </h2>
        {requestsQuery.isLoading ? (
          <SkeletonTable cols={5} rows={3} />
        ) : requestsQuery.error ? (
          <ErrorState
            title="Error al cargar tus solicitudes"
            error={requestsQuery.error}
            onRetry={() => requestsQuery.refetch()}
          />
        ) : !requestsQuery.data || requestsQuery.data.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="Sin solicitudes"
            description="Cuando hagas tu primera solicitud aparecerá acá con su estado"
          />
        ) : (
          <LoanRequestsTable rows={requestsQuery.data} showUserColumn={false} showAdminActions={false} />
        )}
      </div>
    </div>
  );
}
