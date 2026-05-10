'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { adminUsersApi } from '@/lib/api/admin-users';
import { loansApi } from '@/lib/api/loans';
import { paymentsApi } from '@/lib/api/payments';
import { useAuthStore } from '@/lib/auth-store';
import { formatUsdc } from '@/lib/format';
import {
  computeMonthlyLentVsRecovered,
  computeScoreHistogram,
  computeStatusDistribution,
  computeTopBorrowers,
} from '@/lib/reports/aggregations';
import { downloadCsv, toCsv } from '@/lib/reports/csv';
import type { LoanStatus } from '@/lib/api-types';

const STATUS_COLOR: Record<LoanStatus, string> = {
  ACTIVE: '#3b82f6',
  PAID: '#22c55e',
  DEFAULTED: '#ef4444',
  CANCELLED: '#64748b',
};

const STATUS_LABEL: Record<LoanStatus, string> = {
  ACTIVE: 'Activos',
  PAID: 'Pagados',
  DEFAULTED: 'En mora',
  CANCELLED: 'Cancelados',
};

export default function ReportsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'RISK_ANALYST';

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

  const paymentsQuery = useQuery({
    queryKey: ['payments', 'admin', '', ''],
    queryFn: () => paymentsApi.listAllAdmin(),
    enabled: isAdmin,
  });

  const isLoading = usersQuery.isLoading || loansQuery.isLoading || paymentsQuery.isLoading;
  const queryError = usersQuery.error || loansQuery.error || paymentsQuery.error;

  const reports = useMemo(() => {
    if (!usersQuery.data || !loansQuery.data || !paymentsQuery.data) return null;
    return {
      statusDist: computeStatusDistribution(loansQuery.data),
      monthly: computeMonthlyLentVsRecovered(loansQuery.data, paymentsQuery.data),
      histogram: computeScoreHistogram(usersQuery.data),
      topBorrowers: computeTopBorrowers(loansQuery.data, paymentsQuery.data),
    };
  }, [usersQuery.data, loansQuery.data, paymentsQuery.data]);

  function exportLoans() {
    if (!loansQuery.data) return;
    const csv = toCsv(
      loansQuery.data.map((l) => ({
        id: l.id,
        userId: l.userId,
        userName: l.user?.fullName ?? '',
        userEmail: l.user?.email ?? '',
        principal: l.principalAmount,
        interest: l.interestAmount,
        total: l.totalAmount,
        status: l.status,
        termDays: l.loanRequest?.termDays ?? '',
        blockchainTx: l.blockchainTx ?? '',
        createdAt: l.createdAt,
      })),
      [
        { key: 'id', label: 'ID' },
        { key: 'userName', label: 'Usuario' },
        { key: 'userEmail', label: 'Email' },
        { key: 'principal', label: 'Principal (USDC)' },
        { key: 'interest', label: 'Interés (USDC)' },
        { key: 'total', label: 'Total (USDC)' },
        { key: 'status', label: 'Estado' },
        { key: 'termDays', label: 'Plazo (días)' },
        { key: 'blockchainTx', label: 'Tx Solana' },
        { key: 'createdAt', label: 'Creado' },
      ],
    );
    downloadCsv(`credia-loans-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  function exportPayments() {
    if (!paymentsQuery.data) return;
    const csv = toCsv(
      paymentsQuery.data.map((p) => ({
        id: p.id,
        loanId: p.loanId,
        userName: p.loan.user?.fullName ?? '',
        amount: p.amount,
        method: p.paymentMethod,
        status: p.status,
        blockchainTx: p.blockchainTx ?? '',
        paidAt: p.paidAt ?? '',
        createdAt: p.createdAt,
      })),
      [
        { key: 'id', label: 'ID' },
        { key: 'loanId', label: 'Loan ID' },
        { key: 'userName', label: 'Usuario' },
        { key: 'amount', label: 'Monto (USDC)' },
        { key: 'method', label: 'Método' },
        { key: 'status', label: 'Estado' },
        { key: 'blockchainTx', label: 'Tx Solana' },
        { key: 'paidAt', label: 'Pagado' },
        { key: 'createdAt', label: 'Creado' },
      ],
    );
    downloadCsv(`credia-payments-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  if (!isAdmin) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
        Esta vista es solo para roles ADMIN / RISK_ANALYST.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="ml-2">Generando reportes…</span>
      </div>
    );
  }

  if (queryError) {
    return (
      <ErrorState
        title="Error al cargar reportes"
        error={queryError}
        onRetry={() => {
          usersQuery.refetch();
          loansQuery.refetch();
          paymentsQuery.refetch();
        }}
      />
    );
  }

  if (!reports) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Reportes</h1>
          <p className="mt-1 text-sm text-slate-400">
            Vista analítica de cartera, scores y top deudores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportLoans}>
            <Download className="h-4 w-4" />
            CSV créditos
          </Button>
          <Button variant="secondary" size="sm" onClick={exportPayments}>
            <Download className="h-4 w-4" />
            CSV pagos
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Donut: status distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cartera por estado</CardTitle>
            <CardDescription>{loansQuery.data?.length ?? 0} créditos totales</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.statusDist.length === 0 ? (
              <EmptyChart message="No hay créditos para graficar" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={reports.statusDist}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {reports.statusDist.map((b) => (
                      <Cell key={b.status} fill={STATUS_COLOR[b.status]} stroke="#0f172a" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value, _name, item) => {
                      const payload = item?.payload as { total?: number; status?: LoanStatus } | undefined;
                      return [
                        `${Number(value ?? 0)} créditos · ${formatUsdc(payload?.total ?? 0)}`,
                        payload?.status ? STATUS_LABEL[payload.status] : '',
                      ];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    formatter={(value) => STATUS_LABEL[value as LoanStatus] ?? value}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar: monthly lent vs recovered */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prestado vs recuperado</CardTitle>
            <CardDescription>Últimos 6 meses · USDC</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={reports.monthly}>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => formatUsdc(Number(value ?? 0))}
                />
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  formatter={(value) => (value === 'lent' ? 'Prestado' : 'Recuperado')}
                />
                <Bar dataKey="lent" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovered" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Histogram: score distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Distribución de scores</CardTitle>
            <CardDescription>
              {reports.histogram.reduce((s, b) => s + b.count, 0)} usuarios con score calculado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reports.histogram}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${Number(value ?? 0)} usuarios`, 'Cantidad']}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top borrowers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 deudores por monto prestado</CardTitle>
          <CardDescription>Ordenado por capital desembolsado</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {reports.topBorrowers.length === 0 ? (
            <EmptyChart message="No hay deudores para listar" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-900/40">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Créditos</th>
                  <th className="px-4 py-3">Prestado</th>
                  <th className="px-4 py-3">Recuperado</th>
                  <th className="px-4 py-3">Recuperación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reports.topBorrowers.map((b, i) => {
                  const recoveryRate = b.totalLent > 0 ? (b.totalRecovered / b.totalLent) * 100 : 0;
                  const tone =
                    recoveryRate >= 80 ? 'green' : recoveryRate >= 50 ? 'amber' : 'red';
                  return (
                    <tr key={b.userId} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-100">{b.fullName}</div>
                        <div className="text-xs text-slate-500">{b.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{b.loansCount}</td>
                      <td className="px-4 py-3 font-mono text-slate-100">{formatUsdc(b.totalLent)}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {formatUsdc(b.totalRecovered)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={tone}>{recoveryRate.toFixed(1)}%</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/30 text-sm text-slate-500">
      {message}
    </div>
  );
}
