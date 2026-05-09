'use client';

import { useQuery } from '@tanstack/react-query';
import { FileCheck2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonTable } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { LoanRequestForm } from '@/components/loans/loan-request-form';
import { LoanRequestsTable } from '@/components/loans/loan-requests-table';
import { loanRequestsApi } from '@/lib/api/loan-requests';
import { scoresApi } from '@/lib/api/scores';
import { formatUsdc } from '@/lib/format';

export default function SolicitarCreditoPage() {
  const requestsQuery = useQuery({
    queryKey: ['loan-requests', 'me'],
    queryFn: () => loanRequestsApi.listMine(),
  });

  const scoreQuery = useQuery({
    queryKey: ['scores', 'me', 'latest'],
    queryFn: () => scoresApi.getLatest(),
  });

  const maxAmount = scoreQuery.data?.maxCreditAmount;
  const canRequest = scoreQuery.data && scoreQuery.data.score >= 400;

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
          <CardContent className="p-6">
            <p className="text-sm text-slate-300">
              {scoreQuery.data
                ? 'Tu score aún no califica para crédito (mínimo 400). Seguí registrando ventas para mejorarlo.'
                : 'Necesitás calcular tu score primero. Andá a "Mi score" y tocá "Calcular ahora".'}
            </p>
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
