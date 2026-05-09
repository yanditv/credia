'use client';

import { useQuery } from '@tanstack/react-query';
import { CircleDollarSign } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonTable } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { LoansTable } from '@/components/loans/loans-table';
import { PaymentsTable } from '@/components/loans/payments-table';
import { loansApi } from '@/lib/api/loans';
import { paymentsApi } from '@/lib/api/payments';

export default function MisCreditosPage() {
  const loansQuery = useQuery({
    queryKey: ['loans', 'me'],
    queryFn: () => loansApi.listMine(),
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments', 'me'],
    queryFn: () => paymentsApi.listMine(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Mis créditos</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tus créditos activos, pagados y todos tus pagos registrados
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Créditos
        </h2>
        {loansQuery.isLoading ? (
          <SkeletonTable cols={6} rows={3} />
        ) : loansQuery.error ? (
          <ErrorState
            title="Error al cargar créditos"
            error={loansQuery.error}
            onRetry={() => loansQuery.refetch()}
          />
        ) : !loansQuery.data || loansQuery.data.length === 0 ? (
          <EmptyState
            icon={CircleDollarSign}
            title="Sin créditos"
            description="Cuando aprueben tu primera solicitud, aparecerá acá"
          />
        ) : (
          <LoansTable rows={loansQuery.data} showUserColumn={false} />
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Pagos
        </h2>
        {paymentsQuery.isLoading ? (
          <SkeletonTable cols={5} rows={3} />
        ) : paymentsQuery.error ? (
          <ErrorState
            title="Error al cargar pagos"
            error={paymentsQuery.error}
            onRetry={() => paymentsQuery.refetch()}
          />
        ) : !paymentsQuery.data || paymentsQuery.data.length === 0 ? (
          <EmptyState
            icon={CircleDollarSign}
            title="Sin pagos registrados"
            description="Tus pagos aparecerán acá cuando registres alguno"
          />
        ) : (
          <PaymentsTable rows={paymentsQuery.data} showUserColumn={false} />
        )}
      </div>
    </div>
  );
}
