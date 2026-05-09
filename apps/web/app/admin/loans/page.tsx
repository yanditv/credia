'use client';

import { useQuery } from '@tanstack/react-query';
import { LoansTable } from '@/components/loans/loans-table';
import { useAuthStore } from '@/lib/auth-store';
import { loansApi } from '@/lib/api/loans';

// Lista de créditos. USER ve los suyos; ADMIN/RISK_ANALYST ven todos.
export default function LoansPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'RISK_ANALYST';

  const myLoansQuery = useQuery({
    queryKey: ['loans', 'me'],
    queryFn: () => loansApi.listMine(),
    enabled: !isAdmin,
  });

  const allLoansQuery = useQuery({
    queryKey: ['loans', 'all'],
    queryFn: () => loansApi.listAllAdmin(),
    enabled: isAdmin,
  });

  const isLoading = isAdmin ? allLoansQuery.isLoading : myLoansQuery.isLoading;
  const error = isAdmin ? allLoansQuery.error : myLoansQuery.error;
  const rows = isAdmin ? allLoansQuery.data ?? [] : myLoansQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Créditos activos</h1>
        <p className="mt-1 text-sm text-slate-400">
          {isAdmin
            ? 'Cartera completa: créditos activos, pagados y en mora'
            : 'Tus créditos y su estado'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-2">Cargando…</span>
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Error al cargar créditos: {error instanceof Error ? error.message : 'desconocido'}
        </div>
      ) : (
        <LoansTable rows={rows} showUserColumn={isAdmin} />
      )}
    </div>
  );
}
