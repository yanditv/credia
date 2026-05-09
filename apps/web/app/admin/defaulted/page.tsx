'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoansTable } from '@/components/loans/loans-table';
import { AtRiskLoansTable } from '@/components/loans/at-risk-table';
import { useAuthStore } from '@/lib/auth-store';
import { loansApi } from '@/lib/api/loans';
import { analyzeDefaulted } from '@/lib/dashboard/metrics';
import { formatUsdc } from '@/lib/format';

export default function DefaultedPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'RISK_ANALYST';

  const loansQuery = useQuery({
    queryKey: ['loans', 'all'],
    queryFn: () => loansApi.listAllAdmin(),
    enabled: isAdmin,
  });

  const analysis = useMemo(() => {
    if (!loansQuery.data) return null;
    return analyzeDefaulted(loansQuery.data);
  }, [loansQuery.data]);

  if (!isAdmin) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
        Esta vista es solo para roles ADMIN / RISK_ANALYST.
      </div>
    );
  }

  if (loansQuery.isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="ml-2">Calculando análisis de mora…</span>
      </div>
    );
  }

  if (loansQuery.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Mora</h1>
          <p className="mt-1 text-sm text-slate-400">No se pudo cargar el análisis</p>
        </div>
        <ErrorState
          title="Error al cargar análisis de mora"
          error={loansQuery.error}
          onRetry={() => loansQuery.refetch()}
        />
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Mora</h1>
        <p className="mt-1 text-sm text-slate-400">
          Préstamos vencidos sin pago suficiente y cuentas en riesgo
        </p>
      </div>

      {/* Métricas de mora */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={<TrendingDown className="h-5 w-5" />}
          tone="red"
          label="Tasa de mora"
          value={`${analysis.rate.toFixed(1)}%`}
          hint={`${analysis.defaulted.length} de ${loansQuery.data?.length ?? 0} créditos`}
        />
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="red"
          label="Monto en mora"
          value={formatUsdc(analysis.totalDefaulted)}
          hint="Capital + interés DEFAULTED"
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
          label="En riesgo (próximos 7d)"
          value={formatUsdc(analysis.totalAtRisk)}
          hint={`${analysis.atRisk.length} créditos próximos a vencer`}
        />
      </div>

      {/* Tabla mora confirmada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Créditos en mora ({analysis.defaulted.length})
          </CardTitle>
          <CardDescription>
            Acción de admin: marcar en blockchain como DEFAULTED (Track A.3 — pendiente)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoansTable rows={analysis.defaulted} showUserColumn={true} />
        </CardContent>
      </Card>

      {/* Tabla en riesgo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-amber-400" />
            Próximos a vencer ({analysis.atRisk.length})
          </CardTitle>
          <CardDescription>
            Créditos ACTIVE con menos de 7 días de plazo restante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AtRiskLoansTable rows={analysis.atRisk} />
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  tone: 'red' | 'amber' | 'green';
  label: string;
  value: string;
  hint: string;
}

function MetricCard({ icon, tone, label, value, hint }: MetricCardProps) {
  const toneClasses = {
    red: 'bg-red-500/10 text-red-400 ring-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    green: 'bg-green-500/10 text-green-400 ring-green-500/20',
  }[tone];

  return (
    <Card>
      <div className="flex gap-4 p-5">
        <div className={`shrink-0 rounded-lg p-2.5 ring-1 ring-inset ${toneClasses}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-100">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
        </div>
      </div>
    </Card>
  );
}
