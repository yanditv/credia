import { apiFetch } from '../api';
import type { Loan, LoanPayment, LoanStatus, LoanWithUser } from '../api-types';

export const loansApi = {
  listMine: () => apiFetch<Loan[]>('/loans/me'),

  getById: (id: string) =>
    apiFetch<Loan & { payments: LoanPayment[] }>(`/loans/${id}`),

  listAllAdmin: (status?: LoanStatus) => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<LoanWithUser[]>(`/admin/loans${qs}`);
  },
};
