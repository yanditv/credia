'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoanRequestStatusBadge } from './status-badge';
import { ApiError } from '@/lib/api';
import { loanRequestsApi } from '@/lib/api/loan-requests';
import type { LoanRequest, LoanRequestWithUser } from '@/lib/api-types';
import { formatDate, formatUsdc } from '@/lib/format';

type Row = LoanRequest | LoanRequestWithUser;

function isWithUser(row: Row): row is LoanRequestWithUser {
  return 'user' in row && row.user !== undefined;
}

interface LoanRequestsTableProps {
  rows: Row[];
  showUserColumn: boolean;
  showAdminActions: boolean;
}

export function LoanRequestsTable({ rows, showUserColumn, showAdminActions }: LoanRequestsTableProps) {
  const qc = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (id: string) => loanRequestsApi.approve(id),
    onSuccess: (data) => {
      toast.success(`Aprobada — crédito de ${formatUsdc(data.loan.principalAmount)} creado`);
      qc.invalidateQueries({ queryKey: ['loan-requests'] });
      qc.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Error al aprobar';
      toast.error(msg);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => loanRequestsApi.reject(id),
    onSuccess: () => {
      toast.success('Solicitud rechazada');
      qc.invalidateQueries({ queryKey: ['loan-requests'] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Error al rechazar';
      toast.error(msg);
    },
  });

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-sm text-slate-400">
        No hay solicitudes
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/60">
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            {showUserColumn ? <th className="px-4 py-3">Usuario</th> : null}
            <th className="px-4 py-3">Monto</th>
            <th className="px-4 py-3">Plazo</th>
            <th className="px-4 py-3">Propósito</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fecha</th>
            {showAdminActions ? <th className="px-4 py-3 text-right">Acciones</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => {
            const isPending = row.status === 'PENDING';
            const isMutating =
              approveMutation.isPending && approveMutation.variables === row.id ||
              rejectMutation.isPending && rejectMutation.variables === row.id;

            return (
              <tr key={row.id} className="hover:bg-slate-900/40">
                {showUserColumn ? (
                  <td className="px-4 py-3 text-slate-200">
                    {isWithUser(row) ? (
                      <div>
                        <div className="font-medium">{row.user.fullName}</div>
                        <div className="text-xs text-slate-500">{row.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                ) : null}
                <td className="px-4 py-3 font-mono text-slate-100">
                  {formatUsdc(row.requestedAmount)}
                </td>
                <td className="px-4 py-3 text-slate-300">{row.termDays}d</td>
                <td className="max-w-md truncate px-4 py-3 text-slate-300" title={row.purpose}>
                  {row.purpose}
                </td>
                <td className="px-4 py-3">
                  <LoanRequestStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(row.createdAt)}</td>
                {showAdminActions ? (
                  <td className="px-4 py-3 text-right">
                    {isPending ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => approveMutation.mutate(row.id)}
                          loading={isMutating && approveMutation.variables === row.id}
                          disabled={isMutating}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => rejectMutation.mutate(row.id)}
                          loading={isMutating && rejectMutation.variables === row.id}
                          disabled={isMutating}
                        >
                          <X className="h-3.5 w-3.5" />
                          Rechazar
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
