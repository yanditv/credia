import { apiFetch } from '../api';
import type {
  ApproveResult,
  LoanRequest,
  LoanRequestStatus,
  LoanRequestWithUser,
} from '../api-types';

export interface CreateLoanRequestInput {
  requestedAmount: string;
  termDays: 7 | 15 | 30;
  purpose: string;
}

export const loanRequestsApi = {
  listMine: () => apiFetch<LoanRequest[]>('/loan-requests/me'),

  create: (input: CreateLoanRequestInput) =>
    apiFetch<LoanRequest>('/loan-requests', { method: 'POST', body: input }),

  listAllAdmin: (status?: LoanRequestStatus) => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<LoanRequestWithUser[]>(`/admin/loan-requests${qs}`);
  },

  approve: (id: string) =>
    apiFetch<ApproveResult>(`/admin/loan-requests/${id}/approve`, { method: 'PATCH' }),

  reject: (id: string, reason?: string) =>
    apiFetch<LoanRequest>(`/admin/loan-requests/${id}/reject`, {
      method: 'PATCH',
      body: reason ? { reason } : {},
    }),
};
