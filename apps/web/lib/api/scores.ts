import { apiFetch, ApiError } from '../api';
import type { CreditScore } from '../api-types';

export const scoresApi = {
  calculate: () => apiFetch<CreditScore>('/scores/calculate', { method: 'POST' }),
  listMine: () => apiFetch<CreditScore[]>('/scores/me'),
  getLatest: async (): Promise<CreditScore | null> => {
    try {
      return await apiFetch<CreditScore>('/scores/me/latest');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
};
