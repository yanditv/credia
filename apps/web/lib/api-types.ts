// Tipos compartidos de respuestas del API. Idealmente vendrían de
// @credia/shared (en packages/shared); por ahora replicados aquí porque ese
// package no existe todavía. Mantener en sync con packages/api/prisma/schema.prisma

export type LoanRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LoanStatus = 'ACTIVE' | 'PAID' | 'DEFAULTED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'USDC_ON_CHAIN';

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
