'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoanRequestForm } from '@/components/loans/loan-request-form';
import { LoanRequestsTable } from '@/components/loans/loan-requests-table';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/auth-store';
import { loanRequestsApi } from '@/lib/api/loan-requests';

// Página dual:
// - USER: ve sus propias solicitudes + botón "Nueva"
// - ADMIN/RISK_ANALYST: ve todas las solicitudes con aprobar/rechazar inline
export default function LoanRequestsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'RISK_ANALYST';

  const [showForm, setShowForm] = useState(false);

  const myRequestsQuery = useQuery({
    queryKey: ['loan-requests', 'me'],
    queryFn: () => loanRequestsApi.listMine(),
    enabled: !isAdmin,
  });

  const allRequestsQuery = useQuery({
    queryKey: ['loan-requests', 'all'],
    queryFn: () => loanRequestsApi.listAllAdmin(),
    enabled: isAdmin,
  });

  const isLoading = isAdmin ? allRequestsQuery.isLoading : myRequestsQuery.isLoading;
  const error = isAdmin ? allRequestsQuery.error : myRequestsQuery.error;
  const rows = isAdmin ? allRequestsQuery.data ?? [] : myRequestsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Solicitudes de crédito</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isAdmin
              ? 'Aprobar o rechazar solicitudes pendientes de los usuarios'
              : 'Tus solicitudes y su estado actual'}
          </p>
        </div>
        {!isAdmin ? (
          <Button onClick={() => setShowForm((s) => !s)}>
            <Plus className="h-4 w-4" />
            {showForm ? 'Cerrar' : 'Nueva solicitud'}
          </Button>
        ) : null}
      </div>

      {!isAdmin && showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Nueva solicitud</CardTitle>
            <CardDescription>
              El monto se valida contra tu cupo (que depende de tu score)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoanRequestForm
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <SkeletonTable cols={isAdmin ? 7 : 6} rows={4} />
      ) : error ? (
        <ErrorState
          title="Error al cargar solicitudes"
          error={error}
          onRetry={() =>
            isAdmin ? allRequestsQuery.refetch() : myRequestsQuery.refetch()
          }
        />
      ) : (
        <LoanRequestsTable rows={rows} showUserColumn={isAdmin} showAdminActions={isAdmin} />
      )}
    </div>
  );
}
