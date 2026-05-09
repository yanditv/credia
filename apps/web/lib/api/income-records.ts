import { apiFetch } from '../api';
import type { IncomeRecord, IncomeSummary, SourceType } from '../api-types';

export interface CreateIncomeRecordInput {
  sourceType: SourceType;
  amount: string;
  description?: string;
  evidenceUrl?: string;
  recordDate: string;
}

export const incomeRecordsApi = {
  listMine: () => apiFetch<IncomeRecord[]>('/income-records/me'),
  getSummary: () => apiFetch<IncomeSummary>('/income-records/me/summary'),
  create: (input: CreateIncomeRecordInput) =>
    apiFetch<IncomeRecord>('/income-records', { method: 'POST', body: input }),
};
