'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CreditCard,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Wallet,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SolanaVerifiedBadge } from '@/components/blockchain/verified-badge';
import { ScoreGauge } from '@/components/scores/score-gauge';
import { ScoreBreakdown, type ScoreBreakdownData } from '@/components/scores/score-breakdown';
import { adminUsersApi } from '@/lib/api/admin-users';
import { loanRequestsApi } from '@/lib/api/loan-requests';
import { loansApi } from '@/lib/api/loans';
import { LoanRequestsTable } from '@/components/loans/loan-requests-table';
import { LoansTable } from '@/components/loans/loans-table';
import { formatDate, formatUsdc } from '@/lib/format';

// Página perfil de usuario para admin. En Next.js 16 los params son async.
export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const userQuery = useQuery({
    queryKey: ['admin-users', id],
    queryFn: () => adminUsersApi.getById(id),
  });

  // Filtramos client-side las listas globales — evita endpoints adicionales.
  // Para escala mayor convendrá agregar `?userId=` en el backend.
  const requestsQuery = useQuery({
    queryKey: ['loan-requests', 'all'],
    queryFn: () => loanRequestsApi.listAllAdmin(),
  });

  const loansQuery = useQuery({
    queryKey: ['loans', 'all'],
    queryFn: () => loansApi.listAllAdmin(),
  });

  if (userQuery.isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="ml-2">Cargando perfil…</span>
      </div>
    );
  }

  if (userQuery.error) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a usuarios
        </Link>
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Error: {userQuery.error instanceof Error ? userQuery.error.message : 'desconocido'}
        </div>
      </div>
    );
  }

  const user = userQuery.data;
  if (!user) return null;

  const score = user.creditScores[0];
  const breakdown = (score?.breakdown ?? {}) as ScoreBreakdownData;
  const userRequests = (requestsQuery.data ?? []).filter((r) => r.userId === id);
  const userLoans = (loansQuery.data ?? []).filter((l) => l.userId === id);

  return (
    <div className="space-y-6">
      {/* Volver */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a usuarios
      </Link>

      {/* Header con avatar + datos */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 font-mono text-2xl font-bold text-green-400">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">{user.fullName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone={user.role === 'USER' ? 'blue' : user.role === 'ADMIN' ? 'green' : 'amber'}>
                {user.role}
              </Badge>
              <Badge tone={user.status === 'ACTIVE' ? 'green' : 'red'}>{user.status}</Badge>
              <span className="text-xs text-slate-500">
                Miembro desde {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal: score + datos */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Score */}
        <Card>
          <CardHeader>
            <CardTitle>Score crediticio</CardTitle>
            <CardDescription>
              {score
                ? `Hash on-chain: ${score.scoreHash.slice(0, 16)}…`
                : 'Aún no se ha calculado el score'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {score ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 md:items-center">
                  <div className="flex justify-center">
                    <ScoreGauge score={score.score} riskLevel={score.riskLevel} />
                  </div>
                  <ScoreBreakdown data={breakdown} />
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <SolanaVerifiedBadge
                    signature={score.blockchainTx}
                    pendingLabel="Score sin registrar on-chain"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Este usuario aún no tiene score calculado.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Datos personales + negocio */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
              <Row icon={<Phone className="h-4 w-4" />} label="Teléfono" value={user.phone} />
              <Row
                icon={<IdCard className="h-4 w-4" />}
                label="Documento"
                value={user.documentNumber}
              />
              <Row
                icon={<Wallet className="h-4 w-4" />}
                label="Wallet"
                value={
                  user.walletAddress ? (
                    <span className="font-mono text-xs">
                      {user.walletAddress.slice(0, 8)}…{user.walletAddress.slice(-6)}
                    </span>
                  ) : (
                    <span className="italic text-slate-600">no vinculada</span>
                  )
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {user.businessProfile ? (
                <>
                  <Row
                    icon={<Briefcase className="h-4 w-4" />}
                    label="Nombre"
                    value={user.businessProfile.businessName}
                  />
                  <Row
                    icon={<Briefcase className="h-4 w-4" />}
                    label="Tipo"
                    value={user.businessProfile.businessType}
                  />
                  <Row
                    icon={<MapPin className="h-4 w-4" />}
                    label="Ciudad"
                    value={user.businessProfile.city}
                  />
                  <Row
                    icon={<CreditCard className="h-4 w-4" />}
                    label="Ingreso mensual estimado"
                    value={formatUsdc(user.businessProfile.monthlyEstimatedIncome)}
                  />
                  <Row
                    icon={<Calendar className="h-4 w-4" />}
                    label="Antigüedad"
                    value={`${user.businessProfile.yearsActive} año${user.businessProfile.yearsActive !== 1 ? 's' : ''}`}
                  />
                </>
              ) : (
                <p className="italic text-slate-500">Sin perfil de negocio cargado</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loans + Requests */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Solicitudes ({userRequests.length})
          </h2>
          <LoanRequestsTable rows={userRequests} showUserColumn={false} showAdminActions={false} />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Créditos ({userLoans.length})
          </h2>
          <LoansTable rows={userLoans} showUserColumn={false} />
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </span>
      <span className="text-right text-slate-200">{value}</span>
    </div>
  );
}
