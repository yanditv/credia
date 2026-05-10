// Tipos compartidos de respuestas del API. Idealmente vendrían de
// @credia/shared (en packages/shared); por ahora replicados aquí porque ese
// package no existe todavía. Mantener en sync con packages/api/prisma/schema.prisma

export type LoanRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LoanStatus = 'ACTIVE' | 'PAID' | 'DEFAULTED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'USDC_ON_CHAIN';
export type Role = 'USER' | 'ADMIN' | 'RISK_ANALYST';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'ACCEPTABLE' | 'LOW';
export type BusinessType =
  | 'VENDOR'
  | 'MERCHANT'
  | 'DELIVERY'
  | 'TAXI'
  | 'STORE'
  | 'SERVICES'
  | 'AGRICULTURE'
  | 'OTHER';
export type SourceType =
  | 'DAILY_SALES'
  | 'INVOICE'
  | 'QR_PAYMENT'
  | 'DELIVERY'
  | 'REFERENCE'
  | 'OTHER';

export interface IncomeRecord {
  id: string;
  userId: string;
  sourceType: SourceType;
  amount: string;
  description: string | null;
  evidenceUrl: string | null;
  recordDate: string;
  createdAt: string;
}

export interface IncomeSummary {
  totalRecords: number;
  totalAmount: number;
  averageAmount: number;
  bySourceType: { sourceType: SourceType; count: number; total: number }[];
  last30Days: { count: number; total: number };
  last7Days: { count: number; total: number };
}

export interface CreditScore {
  id: string;
  userId: string;
  score: number;
  riskLevel: RiskLevel;
  maxCreditAmount: string;
  scoreHash: string;
  breakdown: Record<string, number>;
  blockchainTx: string | null;
  createdAt: string;
}

export interface UserMe {
  id: string;
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  walletAddress: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface AdminUserSummary {
  id: string;
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  walletAddress: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  businessProfile: { businessName: string; businessType: BusinessType; city: string } | null;
  creditScores: {
    score: number;
    riskLevel: RiskLevel;
    maxCreditAmount: string;
  }[];
}

export interface AdminUserDetail {
  id: string;
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  walletAddress: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  businessProfile: {
    id: string;
    businessName: string;
    businessType: BusinessType;
    city: string;
    monthlyEstimatedIncome: string;
    yearsActive: number;
    createdAt: string;
  } | null;
  creditScores: {
    id: string;
    score: number;
    riskLevel: RiskLevel;
    maxCreditAmount: string;
    scoreHash: string;
    breakdown: Record<string, number>;
  blockchainTx: string | null;
  createdAt: string;
  }[];
}

export interface LoanRequest {
  id: string;
  userId: string;
  requestedAmount: string;
  termDays: number;
  purpose: string;
  status: LoanRequestStatus;
  scoreId: string;
  createdAt: string;
}

export interface LoanRequestWithUser extends LoanRequest {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface Loan {
  id: string;
  userId: string;
  loanRequestId: string;
  principalAmount: string;
  interestAmount: string;
  totalAmount: string;
  status: LoanStatus;
  blockchainTx: string | null;
  blockchainLoanRecord: string | null;
  createdAt: string;
  loanRequest?: { termDays: number; purpose: string };
}

export interface LoanWithUser extends Loan {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  blockchainTx: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface LoanPaymentWithLoan extends LoanPayment {
  loan: {
    id: string;
    principalAmount: string;
    totalAmount: string;
    status: LoanStatus;
    user?: { id: string; fullName: string; email: string };
  };
}

export interface ApproveResult {
  loanRequest: LoanRequest;
  loan: Loan;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  url: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
}

export interface PaginatedAuditResponse {
  data: AuditLogEntry[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
