// Agregaciones para /admin/reports computadas client-side desde
// /admin/loans, /admin/payments, /admin/users. Cuando feat/api/dashboard-metrics
// extienda el endpoint con estas series, swap a server-side.

import type {
  AdminUserSummary,
  LoanPaymentWithLoan,
  LoanStatus,
  LoanWithUser,
} from '../api-types';

export interface StatusBucket {
  status: LoanStatus;
  count: number;
  total: number;
}

export interface MonthlyBucket {
  month: string; // 'YYYY-MM'
  label: string; // 'May 26'
  lent: number;
  recovered: number;
}

export interface ScoreBucket {
  range: string; // '600-699'
  min: number;
  max: number;
  count: number;
}

export interface TopBorrower {
  userId: string;
  fullName: string;
  email: string;
  loansCount: number;
  totalLent: number;
  totalRecovered: number;
}

const SCORE_BUCKETS: { min: number; max: number; range: string }[] = [
  { min: 0, max: 399, range: '< 400' },
  { min: 400, max: 499, range: '400-499' },
  { min: 500, max: 599, range: '500-599' },
  { min: 600, max: 699, range: '600-699' },
  { min: 700, max: 799, range: '700-799' },
  { min: 800, max: 899, range: '800-899' },
  { min: 900, max: 1000, range: '900-1000' },
];

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('es-EC', {
  month: 'short',
  year: '2-digit',
});

export function computeStatusDistribution(loans: LoanWithUser[]): StatusBucket[] {
  const map = new Map<LoanStatus, StatusBucket>();
  for (const l of loans) {
    const bucket = map.get(l.status) ?? { status: l.status, count: 0, total: 0 };
    bucket.count += 1;
    bucket.total += Number(l.principalAmount);
    map.set(l.status, bucket);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function computeMonthlyLentVsRecovered(
  loans: LoanWithUser[],
  payments: LoanPaymentWithLoan[],
  monthsBack = 6,
): MonthlyBucket[] {
  const buckets: MonthlyBucket[] = [];
  const today = new Date();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.push({ month, label: MONTH_LABEL_FORMATTER.format(d), lent: 0, recovered: 0 });
  }
  const idx = new Map(buckets.map((b, i) => [b.month, i]));

  for (const l of loans) {
    const d = new Date(l.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const i = idx.get(key);
    if (i !== undefined) buckets[i].lent += Number(l.principalAmount);
  }

  for (const p of payments) {
    if (p.status !== 'COMPLETED') continue;
    const d = new Date(p.paidAt ?? p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const i = idx.get(key);
    if (i !== undefined) buckets[i].recovered += Number(p.amount);
  }

  return buckets;
}

export function computeScoreHistogram(users: AdminUserSummary[]): ScoreBucket[] {
  const buckets: ScoreBucket[] = SCORE_BUCKETS.map((b) => ({ ...b, count: 0 }));
  for (const u of users) {
    const score = u.creditScores[0]?.score;
    if (score === undefined) continue;
    const bucket = buckets.find((b) => score >= b.min && score <= b.max);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}

export function computeTopBorrowers(
  loans: LoanWithUser[],
  payments: LoanPaymentWithLoan[],
  limit = 10,
): TopBorrower[] {
  const map = new Map<string, TopBorrower>();
  for (const l of loans) {
    const userId = l.userId;
    const existing = map.get(userId) ?? {
      userId,
      fullName: l.user?.fullName ?? 'Desconocido',
      email: l.user?.email ?? '—',
      loansCount: 0,
      totalLent: 0,
      totalRecovered: 0,
    };
    existing.loansCount += 1;
    existing.totalLent += Number(l.principalAmount);
    map.set(userId, existing);
  }
  for (const p of payments) {
    if (p.status !== 'COMPLETED') continue;
    const userId = p.loan.user?.id;
    if (!userId) continue;
    const existing = map.get(userId);
    if (!existing) continue;
    existing.totalRecovered += Number(p.amount);
  }
  return Array.from(map.values())
    .sort((a, b) => b.totalLent - a.totalLent)
    .slice(0, limit);
}
