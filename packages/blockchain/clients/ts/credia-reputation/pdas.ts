import { getAddressEncoder, getProgramDerivedAddress } from '@solana/kit';
import type { Address } from '@solana/kit';
import { CREDIA_REPUTATION_PROGRAM_ADDRESS } from './program.js';

const addressEncoder = getAddressEncoder();
const textEncoder = new TextEncoder();

export async function findUserReputationPda(
  userWallet: Address,
  programAddress: Address = CREDIA_REPUTATION_PROGRAM_ADDRESS,
) {
  return getProgramDerivedAddress({
    programAddress,
    seeds: [textEncoder.encode('reputation'), addressEncoder.encode(userWallet)],
  });
}

export async function findLoanRecordPda(
  targetWallet: Address,
  loanIdHash: Uint8Array,
  programAddress: Address = CREDIA_REPUTATION_PROGRAM_ADDRESS,
) {
  return getProgramDerivedAddress({
    programAddress,
    seeds: [textEncoder.encode('loan'), addressEncoder.encode(targetWallet), loanIdHash],
  });
}

export async function findPaymentRecordPda(
  loanRecord: Address,
  paymentHash: Uint8Array,
  programAddress: Address = CREDIA_REPUTATION_PROGRAM_ADDRESS,
) {
  return getProgramDerivedAddress({
    programAddress,
    seeds: [textEncoder.encode('payment'), addressEncoder.encode(loanRecord), paymentHash],
  });
}
