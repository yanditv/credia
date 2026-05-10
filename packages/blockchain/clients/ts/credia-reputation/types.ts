export type ReputationStatus = 'Pending' | 'Active' | 'Suspended';
export type LoanStatus = 'Active' | 'Paid' | 'Defaulted';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';

export interface UserReputationAccountData {
  wallet: string;
  scoreHash: Uint8Array;
  status: ReputationStatus;
  createdAt: bigint;
  bump: number;
}

export interface LoanRecordAccountData {
  userWallet: string;
  loanIdHash: Uint8Array;
  amountHash: Uint8Array;
  status: LoanStatus;
  createdAt: bigint;
  bump: number;
}

export interface PaymentRecordAccountData {
  loan: string;
  payer: string;
  paymentHash: Uint8Array;
  amountHash: Uint8Array;
  status: PaymentStatus;
  createdAt: bigint;
  bump: number;
}

export interface InitReputationInput {
  scoreHash: Uint8Array;
}

export interface UpdateScoreHashInput {
  scoreHash: Uint8Array;
  status: ReputationStatus;
}

export interface CreateLoanRecordInput {
  loanIdHash: Uint8Array;
  amountHash: Uint8Array;
}

export interface RegisterPaymentInput {
  paymentHash: Uint8Array;
  amountHash: Uint8Array;
}
