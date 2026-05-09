// Cálculo de métricas agregadas para el dashboard. Computa client-side desde
// los endpoints existentes /admin/loans, /admin/payments, /admin/users,
// /admin/loan-requests. Cuando feat/api/dashboard-metrics (Track C3 de Cesar)
// mergee, este archivo se reemplaza por una llamada directa al endpoint real.

import type {
  AdminUserSummary,
  LoanPaymentWithLoan,
  LoanRequestWithUser,
  LoanWithUser,
} from '../api-types';

export interface DailyBucket {
  date: string; // ISO yyyy-mm-dd
  count: number;
  amount: number;
}

export interface DashboardMetrics {
  totalLent: number;
  totalRecovered: number;
  defaultRate: number; // 0-100 (%)
  avgScore: number; // 0-1000
  activeLoans: number;
  pendingRequests: number;
  paidLoans: number;
  defaultedLoans: number;
  // Sparklines (últimos 7 días) — para mostrar trend en KPI cards
  lentSparkline: DailyBucket[];
  recoveredSparkline: DailyBucket[];
  // Serie completa para LineChart de últimos 30 días
  loansLast30Days: DailyBucket[];
}

function toIsoDay(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function emptyBuckets(days: number): DailyBucket[] {
  const out: DailyBucket[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    out.push({ date: toIsoDay(d), count: 0, amount: 0 });
  }
  return out;
}

function bucketize(items: { createdAt: string; amount: number }[], days: number): DailyBucket[] {
  const buckets = emptyBuckets(days);
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const item of items) {
    const day = toIsoDay(item.createdAt);
    const i = index.get(day);
    if (i !== undefined) {
      buckets[i].count += 1;
      buckets[i].amount += item.amount;
    }
  }
  return buckets;
}

export function computeDashboardMetrics(args: {
  loans: LoanWithUser[];
  payments: LoanPaymentWithLoan[];
  requests: LoanRequestWithUser[];
  users: AdminUserSummary[];
}): DashboardMetrics {
  const { loans, payments, requests, users } = args;

  const totalLent = loans.reduce((acc, l) => acc + Number(l.principalAmount), 0);
  const completedPayments = payments.filter((p) => p.status === 'COMPLETED');
  const totalRecovered = completedPayments.reduce((acc, p) => acc + Number(p.amount), 0);

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE').length;
  const paidLoans = loans.filter((l) => l.status === 'PAID').length;
  const defaultedLoans = loans.filter((l) => l.status === 'DEFAULTED').length;
  const defaultRate = loans.length > 0 ? (defaultedLoans / loans.length) * 100 : 0;

  const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;

  // Score promedio: solo users que tienen score; lee el más reciente.
  const usersWithScore = users.filter((u) => u.creditScores.length > 0);
  const avgScore =
    usersWithScore.length > 0
      ? Math.round(
          usersWithScore.reduce((acc, u) => acc + u.creditScores[0].score, 0) /
            usersWithScore.length,
        )
      : 0;

  return {
    totalLent,
    totalRecovered,
    defaultRate,
    avgScore,
    activeLoans,
    paidLoans,
    defaultedLoans,
    pendingRequests,
    lentSparkline: bucketize(
      loans.map((l) => ({ createdAt: l.createdAt, amount: Number(l.principalAmount) })),
      7,
    ),
    recoveredSparkline: bucketize(
      completedPayments.map((p) => ({ createdAt: p.paidAt ?? p.createdAt, amount: Number(p.amount) })),
      7,
    ),
    loansLast30Days: bucketize(
      loans.map((l) => ({ createdAt: l.createdAt, amount: Number(l.principalAmount) })),
      30,
    ),
  };
}

// Para /admin/defaulted: separar loans por urgencia. ACTIVE y dentro de < 7 días
// del vencimiento se consideran "en riesgo" (su term está calculado con
// loanRequest.termDays).
export interface DefaultedAnalysis {
  defaulted: LoanWithUser[];
  atRisk: { loan: LoanWithUser; daysToExpire: number }[];
  totalDefaulted: number;
  totalAtRisk: number;
  rate: number;
}

const DEFAULT_TERM_DAYS_FALLBACK = 30; // si la relación no se cargó

export function analyzeDefaulted(loans: LoanWithUser[]): DefaultedAnalysis {
  const defaulted = loans.filter((l) => l.status === 'DEFAULTED');
  const now = Date.now();

  const atRisk: { loan: LoanWithUser; daysToExpire: number }[] = [];
  for (const loan of loans) {
    if (loan.status !== 'ACTIVE') continue;
    const term = loan.loanRequest?.termDays ?? DEFAULT_TERM_DAYS_FALLBACK;
    const expiresAt = new Date(loan.createdAt).getTime() + term * 86_400_000;
    const daysToExpire = Math.ceil((expiresAt - now) / 86_400_000);
    if (daysToExpire <= 7) {
      atRisk.push({ loan, daysToExpire });
    }
  }
  atRisk.sort((a, b) => a.daysToExpire - b.daysToExpire);

  const totalDefaulted = defaulted.reduce((acc, l) => acc + Number(l.totalAmount), 0);
  const totalAtRisk = atRisk.reduce((acc, x) => acc + Number(x.loan.totalAmount), 0);
  const rate = loans.length > 0 ? (defaulted.length / loans.length) * 100 : 0;

  return { defaulted, atRisk, totalDefaulted, totalAtRisk, rate };
}
