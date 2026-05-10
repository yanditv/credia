import { apiFetch } from '../api';
import type { AdminUserDetail, AdminUserSummary } from '../api-types';

export const adminUsersApi = {
  list: () => apiFetch<AdminUserSummary[]>('/admin/users'),
  getById: (id: string) => apiFetch<AdminUserDetail>(`/admin/users/${id}`),
};
