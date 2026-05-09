'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ScoreGauge } from '@/components/scores/score-gauge';
import { ScoreBreakdown, type ScoreBreakdownData } from '@/components/scores/score-breakdown';
import { SolanaVerifiedBadge } from '@/components/blockchain/verified-badge';
import { OnchainReputationCard } from '@/components/blockchain/onchain-reputation-card';
import { scoresApi } from '@/lib/api/scores';
import { ApiError } from '@/lib/api';
import { formatUsdc, formatDate } from '@/lib/format';

export default function MiScorePage() {
  const qc = useQueryClient();

  const latestQuery = useQuery({
    queryKey: ['scores', 'me', 'latest'],
    queryFn: () => scoresApi.getLatest(),
  });

  const recalculateMutation = useMutation({
    mutationFn: () => scoresApi.calculate(),
    onSuccess: () => {
      toast.success('Score recalculado');
      qc.invalidateQueries({ queryKey: ['scores'] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Error al calcular el score';
      toast.error(msg);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Mi score</h1>
          <p className="mt-1 text-sm text-slate-400">
            Tu puntaje crediticio basado en ventas, pagos y reputación
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => recalculateMutation.mutate()}
          loading={recalculateMutation.isPending}
        >
          <RefreshCw className="h-4 w-4" />
          Recalcular score
        </Button>
      </div>

      {latestQuery.isLoading ? (
        <SkeletonCard height={300} />
      ) : latestQuery.error ? (
        <ErrorState
          title="Error al cargar tu score"
          error={latestQuery.error}
          onRetry={() => latestQuery.refetch()}
        />
      ) : !latestQuery.data ? (
        <EmptyState
          icon={TrendingUp}
          title="Aún no tenés score calculado"
          description="Necesitás al menos 3 registros de ingresos. Calculá tu primer score cuando registres tus primeras ventas."
          action={
            <Button onClick={() => recalculateMutation.mutate()} loading={recalculateMutation.isPending}>
              Calcular ahora
            </Button>
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Tu puntaje actual</CardTitle>
                  <CardDescription>
                    Calculado el {formatDate(latestQuery.data.createdAt)}
                  </CardDescription>
                </div>
                <Badge tone={latestQuery.data.riskLevel === 'LOW' || latestQuery.data.riskLevel === 'ACCEPTABLE' ? 'green' : latestQuery.data.riskLevel === 'MEDIUM' ? 'amber' : 'red'}>
                  {latestQuery.data.riskLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-around">
                <ScoreGauge score={latestQuery.data.score} riskLevel={latestQuery.data.riskLevel} />
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Cupo aprobado</p>
                    <p className="font-mono text-3xl font-bold tabular-nums text-green-400">
                      {formatUsdc(latestQuery.data.maxCreditAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Hash on-chain</p>
                    <p className="mt-1 font-mono text-xs text-slate-400 break-all">
                      {latestQuery.data.scoreHash.slice(0, 32)}…
                    </p>
                  </div>
                  <SolanaVerifiedBadge signature={latestQuery.data.blockchainTx} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalle del score</CardTitle>
              <CardDescription>
                6 componentes ponderados que arman tu puntaje (0-1000)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown data={latestQuery.data.breakdown as ScoreBreakdownData} />
            </CardContent>
          </Card>

          <OnchainReputationCard score={latestQuery.data} />

          {latestQuery.data.score < 400 ? (
            <Card>
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                <div className="text-sm">
                  <p className="font-medium text-slate-200">Tu score aún no califica para crédito</p>
                  <p className="mt-1 text-slate-400">
                    Registrá ventas con regularidad y subí comprobantes para mejorar. Cuando tu score llegue a 400+, vas a poder solicitar tu primer microcrédito.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
