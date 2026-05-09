import { apiFetch, ApiError } from '../api';
import type { BusinessType } from '../api-types';

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  city: string;
  monthlyEstimatedIncome: string;
  yearsActive: number;
  createdAt: string;
}

export interface CreateBusinessProfilePayload {
  businessName: string;
  businessType: BusinessType;
  city: string;
  monthlyEstimatedIncome: string;
  yearsActive: number;
}

export const businessProfileApi = {
  getMine: async (): Promise<BusinessProfile | null> => {
    try {
      return await apiFetch<BusinessProfile>('/business-profile/me');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
  create: (payload: CreateBusinessProfilePayload) =>
    apiFetch<BusinessProfile>('/business-profile', { method: 'POST', body: payload }),
  update: (payload: Partial<CreateBusinessProfilePayload>) =>
    apiFetch<BusinessProfile>('/business-profile/me', { method: 'PATCH', body: payload }),
};
