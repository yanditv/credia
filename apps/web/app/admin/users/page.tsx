'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { adminUsersApi } from '@/lib/api/admin-users';
import { formatUsdc } from '@/lib/format';
import type { Role, UserStatus } from '@/lib/api-types';

const ROLE_TONE: Record<Role, 'green' | 'amber' | 'blue'> = {
  ADMIN: 'green',
  RISK_ANALYST: 'amber',
  USER: 'blue',
};

const STATUS_TONE: Record<UserStatus, 'green' | 'amber' | 'red' | 'slate'> = {
  ACTIVE: 'green',
  PENDING: 'amber',
  SUSPENDED: 'red',
  BLOCKED: 'red',
};

export default function UsersPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUsersApi.list(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Usuarios</h1>
        <p className="mt-1 text-sm text-slate-400">
          Listado de todos los usuarios del sistema con su score actual y datos de negocio
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-2">Cargando usuarios…</span>
        </div>
      ) : error ? (
        <ErrorState title="Error al cargar usuarios" error={error} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-sm text-slate-400">
          No hay usuarios registrados todavía
        </div>
      ) : (
        <div className="grid gap-3">
          {data.map((u) => {
            const score = u.creditScores[0];
            return (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-slate-700 hover:bg-slate-900/70"
              >
                <div className="flex flex-1 items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 font-mono text-lg font-semibold text-green-400"
                    aria-hidden
                  >
                    {u.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-100">{u.fullName}</span>
                      <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                      <Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {u.email}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {u.phone}
                      </span>
                      {u.businessProfile ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {u.businessProfile.businessName}, {u.businessProfile.city}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {score ? (
                    <div className="text-right">
                      <div className="font-mono text-2xl font-bold tabular-nums text-slate-100">
                        {score.score}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">
                        Cupo {formatUsdc(score.maxCreditAmount)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs italic text-slate-600">sin score</span>
                  )}
                  <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-slate-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
