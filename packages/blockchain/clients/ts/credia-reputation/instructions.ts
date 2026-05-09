import type { Address, Instruction } from '@solana/kit';
import { address } from '@solana/kit';
import { AccountRole } from '@solana/instructions';
import {
  CREDIA_REPUTATION_DISCRIMINATOR__CLOSE_LOAN,
  CREDIA_REPUTATION_DISCRIMINATOR__CREATE_LOAN_RECORD,
  CREDIA_REPUTATION_DISCRIMINATOR__INIT_REPUTATION,
  CREDIA_REPUTATION_DISCRIMINATOR__MARK_DEFAULT,
  CREDIA_REPUTATION_DISCRIMINATOR__REGISTER_PAYMENT,
  CREDIA_REPUTATION_DISCRIMINATOR__UPDATE_SCORE_HASH,
  CREDIA_REPUTATION_PROGRAM_ADDRESS,
} from './program.js';
import type {
  CreateLoanRecordInput,
  InitReputationInput,
  RegisterPaymentInput,
  ReputationStatus,
  UpdateScoreHashInput,
} from './types.js';

const SYSTEM_PROGRAM_ADDRESS = address('11111111111111111111111111111111');

function assertArray32(name: string, value: Uint8Array) {
  if (value.length !== 32) {
    throw new Error(`${name} debe tener exactamente 32 bytes`);
  }
}

function encodeReputationStatus(status: ReputationStatus): number {
  switch (status) {
    case 'Pending':
      return 0;
    case 'Active':
      return 1;
    case 'Suspended':
      return 2;
  }
}

function concatBytes(...parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    buffer.set(part, offset);
    offset += part.length;
  }
  return buffer;
}

export function getInitReputationInstruction(accounts: {
  userReputation: Address;
  authority: Address;
}, input: InitReputationInput): Instruction {
  assertArray32('scoreHash', input.scoreHash);
  return {
    programAddress: CREDIA_REPUTATION_PROGRAM_ADDRESS,
    accounts: [
      { address: accounts.userReputation, role: AccountRole.WRITABLE },
      { address: accounts.authority, role: AccountRole.WRITABLE_SIGNER },
      { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
    ],
    data: concatBytes(CREDIA_REPUTATION_DISCRIMINATOR__INIT_REPUTATION, input.scoreHash),
  };
}

export function getUpdateScoreHashInstruction(accounts: {
  targetWallet: Address;
  userReputation: Address;
  admin: Address;
}, input: UpdateScoreHashInput): Instruction {
  assertArray32('scoreHash', input.scoreHash);
  return {
    programAddress: CREDIA_REPUTATION_PROGRAM_ADDRESS,
    accounts: [
      { address: accounts.targetWallet, role: AccountRole.READONLY },
      { address: accounts.userReputation, role: AccountRole.WRITABLE },
      { address: accounts.admin, role: AccountRole.READONLY_SIGNER },
    ],
    data: concatBytes(
      CREDIA_REPUTATION_DISCRIMINATOR__UPDATE_SCORE_HASH,
      input.scoreHash,
      new Uint8Array([encodeReputationStatus(input.status)]),
    ),
  };
}

export function getCreateLoanRecordInstruction(accounts: {
  targetWallet: Address;
  loanRecord: Address;
  admin: Address;
}, input: CreateLoanRecordInput): Instruction {
  assertArray32('loanIdHash', input.loanIdHash);
  assertArray32('amountHash', input.amountHash);
  return {
    programAddress: CREDIA_REPUTATION_PROGRAM_ADDRESS,
    accounts: [
      { address: accounts.targetWallet, role: AccountRole.READONLY },
      { address: accounts.loanRecord, role: AccountRole.WRITABLE },
      { address: accounts.admin, role: AccountRole.WRITABLE_SIGNER },
      { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
    ],
    data: concatBytes(
      CREDIA_REPUTATION_DISCRIMINATOR__CREATE_LOAN_RECORD,
      input.loanIdHash,
      input.amountHash,
    ),
  };
}

export function getRegisterPaymentInstruction(accounts: {
  paymentRecord: Address;
  loanRecord: Address;
  authority: Address;
}, input: RegisterPaymentInput): Instruction {
  assertArray32('paymentHash', input.paymentHash);
  assertArray32('amountHash', input.amountHash);
  return {
    programAddress: CREDIA_REPUTATION_PROGRAM_ADDRESS,
    accounts: [
      { address: accounts.paymentRecord, role: AccountRole.WRITABLE },
      { address: accounts.loanRecord, role: AccountRole.WRITABLE },
      { address: accounts.authority, role: AccountRole.WRITABLE_SIGNER },
      { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
    ],
    data: concatBytes(
      CREDIA_REPUTATION_DISCRIMINATOR__REGISTER_PAYMENT,
      input.paymentHash,
      input.amountHash,
    ),
  };
}

export function getCloseLoanInstruction(accounts: {
  targetWallet: Address;
  loanRecord: Address;
  admin: Address;
}): Instruction {
  return {
    programAddress: CREDIA_REPUTATION_PROGRAM_ADDRESS,
    accounts: [
      { address: accounts.targetWallet, role: AccountRole.READONLY },
      { address: accounts.loanRecord, role: AccountRole.WRITABLE },
      { address: accounts.admin, role: AccountRole.READONLY_SIGNER },
    ],
    data: CREDIA_REPUTATION_DISCRIMINATOR__CLOSE_LOAN,
  };
}

export function getMarkDefaultInstruction(accounts: {
  targetWallet: Address;
  loanRecord: Address;
  admin: Address;
}): Instruction {
  return {
    programAddress: CREDIA_REPUTATION_PROGRAM_ADDRESS,
    accounts: [
      { address: accounts.targetWallet, role: AccountRole.READONLY },
      { address: accounts.loanRecord, role: AccountRole.WRITABLE },
      { address: accounts.admin, role: AccountRole.READONLY_SIGNER },
    ],
    data: CREDIA_REPUTATION_DISCRIMINATOR__MARK_DEFAULT,
  };
}
