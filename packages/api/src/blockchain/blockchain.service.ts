import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { address, createClient } from '@solana/kit';
import { solanaDevnetRpc } from '@solana/kit-plugin-rpc';
import { signer } from '@solana/kit-plugin-signer';
import { createKeyPairSignerFromBytes } from '@solana/signers';
import type { KeyPairSigner } from '@solana/signers';
import {
  CREDIA_REPUTATION_ADMIN_ADDRESS,
  findLoanRecordPda,
  findPaymentRecordPda,
  findUserReputationPda,
  getCloseLoanInstruction,
  getCreateLoanRecordInstruction,
  getMarkDefaultInstruction,
  getRegisterPaymentInstruction,
  getUpdateScoreHashInstruction,
} from '@credia/blockchain/clients/ts/credia-reputation';
import type { ReputationStatus } from '@credia/blockchain/clients/ts/credia-reputation';

export interface RegisterScoreHashInput {
  targetWallet: string;
  scoreHashHex: string;
  status: ReputationStatus;
}

export interface RegisterLoanInput {
  targetWallet: string;
  loanIdHashHex: string;
  amountHashHex: string;
}

export interface RegisterPaymentInput {
  loanRecord: string;
  paymentHashHex: string;
  amountHashHex: string;
  payerSecretKey?: string;
}

export interface AdminLoanActionInput {
  targetWallet: string;
  loanIdHashHex: string;
}

@Injectable()
export class BlockchainService {
  private clientPromise?: Promise<Awaited<ReturnType<BlockchainService['createClientForSigner']>>>;

  constructor(private readonly config: ConfigService) {}

  async registerScoreHash(input: RegisterScoreHashInput) {
    const client = await this.getAdminClient();
    const targetWallet = address(input.targetWallet);
    const [userReputation] = await findUserReputationPda(targetWallet);

    const signature = await client.sendTransaction([
      getUpdateScoreHashInstruction(
        {
          targetWallet,
          userReputation,
          admin: CREDIA_REPUTATION_ADMIN_ADDRESS,
        },
        {
          scoreHash: this.hexToBytes32(input.scoreHashHex),
          status: input.status,
        },
      ),
    ]);

    return { signature, userReputation };
  }

  async registerLoan(input: RegisterLoanInput) {
    const client = await this.getAdminClient();
    const targetWallet = address(input.targetWallet);
    const loanIdHash = this.hexToBytes32(input.loanIdHashHex);
    const [loanRecord] = await findLoanRecordPda(targetWallet, loanIdHash);

    const signature = await client.sendTransaction([
      getCreateLoanRecordInstruction(
        {
          targetWallet,
          loanRecord,
          admin: CREDIA_REPUTATION_ADMIN_ADDRESS,
        },
        {
          loanIdHash,
          amountHash: this.hexToBytes32(input.amountHashHex),
        },
      ),
    ]);

    return { signature, loanRecord };
  }

  async registerPayment(input: RegisterPaymentInput) {
    const payerSigner = input.payerSecretKey
      ? await this.loadSignerFromEnvJson(input.payerSecretKey)
      : await this.getAdminSigner();
    const client = await this.createClientForSigner(payerSigner);
    const loanRecord = address(input.loanRecord);
    const paymentHash = this.hexToBytes32(input.paymentHashHex);
    const [paymentRecord] = await findPaymentRecordPda(loanRecord, paymentHash);

    const signature = await client.sendTransaction([
      getRegisterPaymentInstruction(
        {
          paymentRecord,
          loanRecord,
          authority: payerSigner.address,
        },
        {
          paymentHash,
          amountHash: this.hexToBytes32(input.amountHashHex),
        },
      ),
    ]);

    return { signature, paymentRecord };
  }

  async closeLoan(input: AdminLoanActionInput) {
    const client = await this.getAdminClient();
    const targetWallet = address(input.targetWallet);
    const [loanRecord] = await findLoanRecordPda(
      targetWallet,
      this.hexToBytes32(input.loanIdHashHex),
    );

    const signature = await client.sendTransaction([
      getCloseLoanInstruction({
        targetWallet,
        loanRecord,
        admin: CREDIA_REPUTATION_ADMIN_ADDRESS,
      }),
    ]);

    return { signature, loanRecord };
  }

  async markDefault(input: AdminLoanActionInput) {
    const client = await this.getAdminClient();
    const targetWallet = address(input.targetWallet);
    const [loanRecord] = await findLoanRecordPda(
      targetWallet,
      this.hexToBytes32(input.loanIdHashHex),
    );

    const signature = await client.sendTransaction([
      getMarkDefaultInstruction({
        targetWallet,
        loanRecord,
        admin: CREDIA_REPUTATION_ADMIN_ADDRESS,
      }),
    ]);

    return { signature, loanRecord };
  }

  private async getAdminClient() {
    if (!this.clientPromise) {
      this.clientPromise = this.createClientForSigner(await this.getAdminSigner());
    }
    return this.clientPromise;
  }

  private async getAdminSigner(): Promise<KeyPairSigner> {
    const serialized = this.config.getOrThrow<string>('ADMIN_KEYPAIR');
    return this.loadSignerFromEnvJson(serialized);
  }

  private async loadSignerFromEnvJson(serialized: string): Promise<KeyPairSigner> {
    const bytes = Uint8Array.from(JSON.parse(serialized) as number[]);
    return createKeyPairSignerFromBytes(bytes);
  }

  private async createClientForSigner(existingSigner: KeyPairSigner) {
    return await createClient().use(signer(existingSigner)).use(solanaDevnetRpc());
  }

  private hexToBytes32(value: string) {
    const normalized = value.toLowerCase().replace(/^0x/, '');
    if (!/^[0-9a-f]{64}$/.test(normalized)) {
      throw new Error('Se esperaba un hash hex de 32 bytes');
    }
    return Uint8Array.from(normalized.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)));
  }
}
