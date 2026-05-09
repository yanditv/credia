'use client';

import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type {
  LoanPaymentWithLoan,
  PaymentMethod,
  PaymentStatus,
} from '@/lib/api-types';
import { formatDate, formatUsdc } from '@/lib/format';

const STATUS_TONE: Record<PaymentStatus, { tone: 'amber' | 'green' | 'red'; label: string }> = {
  PENDING: { tone: 'amber', label: 'Pendiente' },
  COMPLETED: { tone: 'green', label: 'Completado' },
  FAILED: { tone: 'red', label: 'Fallido' },
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  USDC_ON_CHAIN: 'USDC on-chain',
};

const SOLANA_EXPLORER = 'https://explorer.solana.com';

export function PaymentsTable({
  rows,
  showUserColumn,
}: {
  rows: LoanPaymentWithLoan[];
  showUserColumn: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-sm text-slate-400">
        No hay pagos registrados
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
            <th className="px-4 py-3">Método</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Tx blockchain</th>
            <th className="px-4 py-3">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => {
            const statusCfg = STATUS_TONE[row.status];
            const isOnChain = row.paymentMethod === 'USDC_ON_CHAIN';

            return (
              <tr key={row.id} className="hover:bg-slate-900/40">
                {showUserColumn ? (
                  <td className="px-4 py-3 text-slate-200">
                    {row.loan.user ? (
                      <div>
                        <div className="font-medium">{row.loan.user.fullName}</div>
                        <div className="text-xs text-slate-500">{row.loan.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                ) : null}
                <td className="px-4 py-3 font-mono text-slate-100">{formatUsdc(row.amount)}</td>
                <td className="px-4 py-3 text-slate-300">
                  <div className="flex items-center gap-2">
                    {METHOD_LABEL[row.paymentMethod]}
                    {isOnChain && row.blockchainTx ? (
                      <Badge tone="green">Solana</Badge>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusCfg.tone}>{statusCfg.label}</Badge>
                </td>
                <td className="px-4 py-3 text-xs">
                  {row.blockchainTx ? (
                    <a
                      href={`${SOLANA_EXPLORER}/tx/${row.blockchainTx}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-blue-400 hover:text-blue-300 hover:underline"
                      title={row.blockchainTx}
                    >
                      {row.blockchainTx.slice(0, 8)}…{row.blockchainTx.slice(-6)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDate(row.paidAt ?? row.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
