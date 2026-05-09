'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LoanStatusBadge } from './status-badge';
import type { LoanWithUser } from '@/lib/api-types';
import { formatDate, formatUsdc } from '@/lib/format';

interface AtRiskRow {
  loan: LoanWithUser;
  daysToExpire: number;
}

function urgencyTone(days: number): 'red' | 'amber' | 'slate' {
  if (days <= 0) return 'red';
  if (days <= 3) return 'amber';
  return 'slate';
}

function urgencyLabel(days: number): string {
  if (days < 0) return `Vencido hace ${Math.abs(days)}d`;
  if (days === 0) return 'Vence hoy';
  return `Vence en ${days}d`;
}

export function AtRiskLoansTable({ rows }: { rows: AtRiskRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-sm text-slate-400">
        No hay créditos próximos a vencer 🎉
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/60">
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            <th className="px-4 py-3">Usuario</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Urgencia</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Creado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map(({ loan, daysToExpire }) => (
            <tr key={loan.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3">
                {loan.user ? (
                  <Link
                    href={`/admin/users/${loan.user.id}`}
                    className="text-slate-200 hover:text-slate-100"
                  >
                    <div className="font-medium">{loan.user.fullName}</div>
                    <div className="text-xs text-slate-500">{loan.user.email}</div>
                  </Link>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-slate-100">
                {formatUsdc(loan.totalAmount)}
              </td>
              <td className="px-4 py-3">
                <Badge tone={urgencyTone(daysToExpire)}>{urgencyLabel(daysToExpire)}</Badge>
              </td>
              <td className="px-4 py-3">
                <LoanStatusBadge status={loan.status} />
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">{formatDate(loan.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
