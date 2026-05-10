import { apiFetch } from '../api';
import type { PaginatedAuditResponse } from '../api-types';

export interface AuditListParams {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
}

function buildQuery(params: AuditListParams): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.action) qs.set('action', params.action);
  if (params.userId) qs.set('userId', params.userId);
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const auditApi = {
  list: (params: AuditListParams = {}) =>
    apiFetch<PaginatedAuditResponse>(`/admin/audit${buildQuery(params)}`),
};
