import { apiFetch } from '../api';
import type {
  LoanPayment,
  LoanPaymentWithLoan,
  PaymentMethod,
  PaymentStatus,
} from '../api-types';

export interface AdminPaymentsFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
}

export const paymentsApi = {
  listMine: () => apiFetch<LoanPaymentWithLoan[]>('/payments/me'),

  listAllAdmin: (filters: AdminPaymentsFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.method) params.set('method', filters.method);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<LoanPaymentWithLoan[]>(`/admin/payments${qs}`);
  },

  listForLoan: (loanId: string) =>
    apiFetch<LoanPayment[]>(`/loans/${loanId}/payments`),
};
