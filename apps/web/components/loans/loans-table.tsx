'use client';

import { LoanStatusBadge } from './status-badge';
import { TransactionLink } from '@/components/blockchain/transaction-link';
import { AddressLink } from '@/components/blockchain/address-link';
import type { Loan, LoanWithUser } from '@/lib/api-types';
import { formatDate, formatUsdc } from '@/lib/format';

type Row = Loan | LoanWithUser;

function isWithUser(row: Row): row is LoanWithUser {
  return 'user' in row && (row as LoanWithUser).user !== undefined;
}

function isValidTx(sig: string | null | undefined): sig is string {
  return typeof sig === 'string' && sig.length > 10 && sig !== '[object Object]';
}

export function LoansTable({ rows, showUserColumn }: { rows: Row[]; showUserColumn: boolean }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-sm text-slate-400">
        No hay créditos
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/60">
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            {showUserColumn ? <th className="px-4 py-3">Usuario</th> : null}
            <th className="px-4 py-3">Principal</th>
            <th className="px-4 py-3">Interés</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Plazo</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Tx blockchain</th>
            <th className="px-4 py-3">Creado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => (
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
              <td className="px-4 py-3 font-mono text-slate-100">{formatUsdc(row.principalAmount)}</td>
              <td className="px-4 py-3 font-mono text-slate-400">{formatUsdc(row.interestAmount)}</td>
              <td className="px-4 py-3 font-mono font-semibold text-slate-100">
                {formatUsdc(row.totalAmount)}
              </td>
              <td className="px-4 py-3 text-slate-300">
                {row.loanRequest?.termDays ? `${row.loanRequest.termDays}d` : '—'}
              </td>
              <td className="px-4 py-3">
                <LoanStatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3 text-xs">
                {isValidTx(row.blockchainTx) ? (
                  <TransactionLink signature={row.blockchainTx} />
                ) : row.blockchainLoanRecord ? (
                  <AddressLink address={row.blockchainLoanRecord} />
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
