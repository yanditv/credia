'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PaymentsTable } from '@/components/loans/payments-table';
import { useAuthStore } from '@/lib/auth-store';
import { paymentsApi } from '@/lib/api/payments';
import type { PaymentMethod, PaymentStatus } from '@/lib/api-types';

export default function PaymentsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'RISK_ANALYST';

  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');

  const myPaymentsQuery = useQuery({
    queryKey: ['payments', 'me'],
    queryFn: () => paymentsApi.listMine(),
    enabled: !isAdmin,
  });

  const allPaymentsQuery = useQuery({
    queryKey: ['payments', 'admin', statusFilter, methodFilter],
    queryFn: () =>
      paymentsApi.listAllAdmin({
        status: statusFilter || undefined,
        method: methodFilter || undefined,
      }),
    enabled: isAdmin,
  });

  const isLoading = isAdmin ? allPaymentsQuery.isLoading : myPaymentsQuery.isLoading;
  const error = isAdmin ? allPaymentsQuery.error : myPaymentsQuery.error;
  const rows = isAdmin ? allPaymentsQuery.data ?? [] : myPaymentsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Pagos</h1>
        <p className="mt-1 text-sm text-slate-400">
          {isAdmin
            ? 'Histórico de todos los pagos registrados — efectivo, transferencia y USDC on-chain'
            : 'Tus pagos a través de todos tus créditos'}
        </p>
      </div>

      {isAdmin ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="status">Estado</Label>
            <Select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')}
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="COMPLETED">Completados</option>
              <option value="FAILED">Fallidos</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="method">Método</Label>
            <Select
              id="method"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | '')}
            >
              <option value="">Todos</option>
              <option value="CASH">Efectivo</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="USDC_ON_CHAIN">USDC on-chain</option>
            </Select>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-2">Cargando…</span>
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Error al cargar pagos: {error instanceof Error ? error.message : 'desconocido'}
        </div>
      ) : (
        <PaymentsTable rows={rows} showUserColumn={isAdmin} />
      )}
    </div>
  );
}
