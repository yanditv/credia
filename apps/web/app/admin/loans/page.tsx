'use client';

import { useQuery } from '@tanstack/react-query';
import { LoansTable } from '@/components/loans/loans-table';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonTable } from '@/components/ui/skeleton';
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
        <SkeletonTable cols={isAdmin ? 7 : 6} rows={4} />
      ) : error ? (
        <ErrorState
          title="Error al cargar créditos"
          error={error}
          onRetry={() =>
            isAdmin ? allLoansQuery.refetch() : myLoansQuery.refetch()
          }
        />
      ) : (
        <LoansTable rows={rows} showUserColumn={isAdmin} />
      )}
    </div>
  );
}
