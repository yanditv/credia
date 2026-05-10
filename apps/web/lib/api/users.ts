import { apiFetch } from '../api';
import type { UserMe } from '../api-types';

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
  email?: string;
}

export const usersApi = {
  getMe: () => apiFetch<UserMe>('/users/me'),
  updateMe: (payload: UpdateUserPayload) =>
    apiFetch<UserMe>('/users/me', { method: 'PATCH', body: payload }),
};
