'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { LoansLineChart } from '@/components/dashboard/loans-line-chart';
import { LoanRequestsTable } from '@/components/loans/loan-requests-table';
import { useAuthStore } from '@/lib/auth-store';
import { adminUsersApi } from '@/lib/api/admin-users';
import { loanRequestsApi } from '@/lib/api/loan-requests';
import { loansApi } from '@/lib/api/loans';
import { paymentsApi } from '@/lib/api/payments';
import { computeDashboardMetrics } from '@/lib/dashboard/metrics';
import { formatUsdc } from '@/lib/format';

// Dashboard admin con métricas reales computadas client-side desde los
// endpoints existentes. Cuando feat/api/dashboard-metrics (Cesar Track C3)
// mergee, swap a una sola query GET /admin/dashboard/metrics.

export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'RISK_ANALYST';

  // 4 queries en paralelo. Comparten cache con las páginas individuales.
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUsersApi.list(),
    enabled: isAdmin,
  });

  const loansQuery = useQuery({
    queryKey: ['loans', 'all'],
    queryFn: () => loansApi.listAllAdmin(),
    enabled: isAdmin,
  });

  const requestsQuery = useQuery({
    queryKey: ['loan-requests', 'all'],
    queryFn: () => loanRequestsApi.listAllAdmin(),
    enabled: isAdmin,
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments', 'admin', '', ''],
    queryFn: () => paymentsApi.listAllAdmin(),
    enabled: isAdmin,
  });

  const isLoading =
    usersQuery.isLoading ||
    loansQuery.isLoading ||
    requestsQuery.isLoading ||
    paymentsQuery.isLoading;

  const metrics = useMemo(() => {
    if (
      !usersQuery.data ||
      !loansQuery.data ||
      !requestsQuery.data ||
      !paymentsQuery.data
    ) {
      return null;
    }
    return computeDashboardMetrics({
      users: usersQuery.data,
      loans: loansQuery.data,
      requests: requestsQuery.data,
      payments: paymentsQuery.data,
    });
  }, [usersQuery.data, loansQuery.data, requestsQuery.data, paymentsQuery.data]);

  // Para usuarios USER (no admin) — vista distinta sin métricas globales
  if (!isAdmin) {
    return <UserDashboard />;
  }

  if (isLoading || !metrics) {
    return <DashboardSkeleton />;
  }

  const pendingRequests = (requestsQuery.data ?? [])
    .filter((r) => r.status === 'PENDING')
    .slice(0, 5);

  const recoveryRate =
    metrics.totalLent > 0 ? (metrics.totalRecovered / metrics.totalLent) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vista general de cartera, créditos activos y solicitudes pendientes
        </p>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total prestado"
          value={formatUsdc(metrics.totalLent)}
          hint={`${metrics.activeLoans + metrics.paidLoans + metrics.defaultedLoans} créditos`}
          sparkline={metrics.lentSparkline}
          sparklineColor="#22c55e"
        />
        <KpiCard
          label="Total recuperado"
          value={formatUsdc(metrics.totalRecovered)}
          hint={`${recoveryRate.toFixed(1)}% recuperación`}
          sparkline={metrics.recoveredSparkline}
          sparklineColor="#3b82f6"
        />
        <KpiCard
          label="% Mora"
          value={`${metrics.defaultRate.toFixed(1)}%`}
          hint={`${metrics.defaultedLoans} créditos en default`}
          sparklineColor="#ef4444"
          invertTrend
        />
        <KpiCard
          label="Score promedio"
          value={metrics.avgScore > 0 ? metrics.avgScore.toString() : '—'}
          hint="Sobre 1000 · cohorte ACTIVE"
          sparklineColor="#f59e0b"
        />
      </div>

      {/* LineChart 30 días */}
      <Card>
        <CardHeader>
          <div className="flex items-baseline justify-between">
            <div>
              <CardTitle>Créditos desembolsados</CardTitle>
              <CardDescription>Últimos 30 días</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LoansLineChart data={metrics.loansLast30Days} />
        </CardContent>
      </Card>

      {/* Tabla pendientes top 5 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Solicitudes pendientes</CardTitle>
              <CardDescription>
                {metrics.pendingRequests} en cola · mostrando últimas {Math.min(5, metrics.pendingRequests)}
              </CardDescription>
            </div>
            <Link
              href="/admin/loan-requests"
              className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <LoanRequestsTable
            rows={pendingRequests}
            showUserColumn={true}
            showAdminActions={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-40 rounded bg-slate-800" />
        <div className="mt-2 h-4 w-64 rounded bg-slate-800/60" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-xl border border-slate-800 bg-slate-900/40" />
        ))}
      </div>
      <div className="h-80 rounded-xl border border-slate-800 bg-slate-900/40" />
      <div className="h-48 rounded-xl border border-slate-800 bg-slate-900/40" />
    </div>
  );
}

// Vista para users USER — sin métricas globales, solo accesos rápidos
function UserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Bienvenido</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tus créditos, solicitudes y score en un solo lugar
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/loan-requests"
          className="group rounded-xl border border-slate-800 bg-slate-900/40 p-6 transition-colors hover:border-green-500/40 hover:bg-slate-900/70"
        >
          <h2 className="font-semibold text-slate-100">Mis solicitudes</h2>
          <p className="mt-1 text-sm text-slate-400">
            Revisar status y crear nuevas solicitudes
          </p>
          <ArrowRight className="mt-3 h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-green-400" />
        </Link>
        <Link
          href="/admin/loans"
          className="group rounded-xl border border-slate-800 bg-slate-900/40 p-6 transition-colors hover:border-green-500/40 hover:bg-slate-900/70"
        >
          <h2 className="font-semibold text-slate-100">Mis créditos</h2>
          <p className="mt-1 text-sm text-slate-400">Créditos activos, pagos y mora</p>
          <ArrowRight className="mt-3 h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-green-400" />
        </Link>
      </div>
    </div>
  );
}
