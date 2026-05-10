import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { address, createClient } from '@solana/kit';
import { solanaDevnetRpc, solanaRpc } from '@solana/kit-plugin-rpc';
import { signer } from '@solana/kit-plugin-signer';
import { tokenProgram } from '@solana-program/token';
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

export interface DisburseUsdcInput {
  recipientWallet: string;
  amount: string;
}

export interface WalletBalance {
  address: string;
  sol: { lamports: string; ui: string };
  usdc: { raw: string; ui: string; decimals: number };
}

export class UsdcDisbursementError extends Error {
  constructor(
    message: string,
    readonly signature?: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'UsdcDisbursementError';
  }
}

@Injectable()
export class BlockchainService {
  private clientPromise?: Promise<Awaited<ReturnType<BlockchainService['createClientForSigner']>>>;

  constructor(private readonly config: ConfigService) {}

  async registerScoreHash(input: RegisterScoreHashInput) {
    const client = await this.getAdminClient();
    const targetWallet = address(input.targetWallet);
    const [userReputation] = await findUserReputationPda(targetWallet);

    const plan = await client.sendTransaction([
      getUpdateScoreHashInstruction(
        { targetWallet, userReputation, admin: CREDIA_REPUTATION_ADMIN_ADDRESS },
        { scoreHash: this.hexToBytes32(input.scoreHashHex), status: input.status },
      ),
    ]);

    const signature = await this.sendAndGetSignature(plan);
    return { signature, userReputation };
  }

  async registerLoan(input: RegisterLoanInput) {
    const client = await this.getAdminClient();
    const targetWallet = address(input.targetWallet);
    const loanIdHash = this.hexToBytes32(input.loanIdHashHex);
    const [loanRecord] = await findLoanRecordPda(targetWallet, loanIdHash);

    const plan = await client.sendTransaction([
      getCreateLoanRecordInstruction(
        { targetWallet, loanRecord, admin: CREDIA_REPUTATION_ADMIN_ADDRESS },
        { loanIdHash, amountHash: this.hexToBytes32(input.amountHashHex) },
      ),
    ]);

    const signature = await this.sendAndGetSignature(plan);
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

    const plan = await client.sendTransaction([
      getRegisterPaymentInstruction(
        { paymentRecord, loanRecord, authority: payerSigner.address },
        { paymentHash, amountHash: this.hexToBytes32(input.amountHashHex) },
      ),
    ]);

    const signature = await this.sendAndGetSignature(plan);
    return { signature, paymentRecord };
  }

  async closeLoan(input: AdminLoanActionInput) {
    const client = await this.getAdminClient();
    const targetWallet = address(input.targetWallet);
    const [loanRecord] = await findLoanRecordPda(targetWallet, this.hexToBytes32(input.loanIdHashHex));

    const plan = await client.sendTransaction([
      getCloseLoanInstruction({ targetWallet, loanRecord, admin: CREDIA_REPUTATION_ADMIN_ADDRESS }),
    ]);

    const signature = await this.sendAndGetSignature(plan);
    return { signature, loanRecord };
  }

  async markDefault(input: AdminLoanActionInput) {
    const client = await this.getAdminClient();
    const targetWallet = address(input.targetWallet);
    const [loanRecord] = await findLoanRecordPda(targetWallet, this.hexToBytes32(input.loanIdHashHex));

    const plan = await client.sendTransaction([
      getMarkDefaultInstruction({ targetWallet, loanRecord, admin: CREDIA_REPUTATION_ADMIN_ADDRESS }),
    ]);

    const signature = await this.sendAndGetSignature(plan);
    return { signature, loanRecord };
  }

  isUsdcDisbursementEnabled(): boolean {
    return this.config.get<string>('USDC_DISBURSEMENT_ENABLED') === 'true';
  }

  async disburseUsdc(input: DisburseUsdcInput) {
    const adminSigner = await this.getAdminSigner();
    const client = await this.createTokenClientForSigner(adminSigner);

    try {
      const signature = await client.token.instructions
        .transferToATA({
          mint: address(this.getUsdcMintAddress()),
          authority: adminSigner,
          recipient: address(input.recipientWallet),
          amount: this.decimalAmountToBaseUnits(input.amount, this.getUsdcDecimals()),
          decimals: this.getUsdcDecimals(),
        })
        .sendTransaction();

      return { signature };
    } catch (error: unknown) {
      throw new UsdcDisbursementError(
        'No se pudo confirmar el desembolso USDC',
        this.extractSignatureFromError(error),
        error,
      );
    }
  }

  // Read-only: balance de SOL + USDC para cualquier wallet (USER o admin treasury).
  // Usa JSON-RPC directo via fetch para no depender de la API de queries de
  // @solana/kit (que cambió de shape entre versiones — ver fix #63).
  async getWalletBalance(walletAddress: string): Promise<WalletBalance> {
    const usdcMint = this.getUsdcMintAddress();
    const usdcDecimals = this.getUsdcDecimals();

    const [solRes, usdcAccounts] = await Promise.all([
      this.rpcCall<{ value: number }>('getBalance', [walletAddress]),
      this.rpcCall<{
        value: { account: { data: { parsed: { info: { tokenAmount: { amount: string } } } } } }[];
      }>('getTokenAccountsByOwner', [
        walletAddress,
        { mint: usdcMint },
        { encoding: 'jsonParsed' },
      ]),
    ]);

    const lamports = BigInt(solRes.value);
    const solUi = (Number(lamports) / 1e9).toFixed(4);

    let usdcRaw = 0n;
    for (const account of usdcAccounts.value) {
      usdcRaw += BigInt(account.account.data.parsed.info.tokenAmount.amount);
    }
    const usdcUi = (Number(usdcRaw) / 10 ** usdcDecimals).toFixed(2);

    return {
      address: walletAddress,
      sol: { lamports: lamports.toString(), ui: solUi },
      usdc: { raw: usdcRaw.toString(), ui: usdcUi, decimals: usdcDecimals },
    };
  }

  async getAdminAddress(): Promise<string> {
    const signer = await this.getAdminSigner();
    return signer.address;
  }

  private async rpcCall<T>(method: string, params: unknown[]): Promise<T> {
    const res = await fetch(this.getRpcUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    if (!res.ok) {
      throw new Error(`RPC ${method} returned HTTP ${res.status}`);
    }
    const data = (await res.json()) as { result?: T; error?: { message: string } };
    if (data.error) {
      throw new Error(`RPC ${method} error: ${data.error.message}`);
    }
    if (data.result === undefined) {
      throw new Error(`RPC ${method} returned no result`);
    }
    return data.result;
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

  private async createTokenClientForSigner(existingSigner: KeyPairSigner) {
    return await createClient()
      .use(signer(existingSigner))
      .use(solanaRpc({ rpcUrl: this.getRpcUrl() }))
      .use(tokenProgram());
  }

  private getRpcUrl(): string {
    return this.config.get<string>('SOLANA_RPC_URL') ?? 'https://api.devnet.solana.com';
  }

  private getUsdcMintAddress(): string {
    return this.config.get<string>('SOLANA_USDC_MINT') ?? 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
  }

  private getUsdcDecimals(): number {
    return Number(this.config.get<string>('SOLANA_USDC_DECIMALS') ?? '6');
  }

  private decimalAmountToBaseUnits(value: string, decimals: number): bigint {
    if (!/^\d+(\.\d+)?$/.test(value)) {
      throw new Error('Monto USDC inválido');
    }

    const [whole, fraction = ''] = value.split('.');
    if (fraction.length > decimals) {
      throw new Error(`El monto USDC excede ${decimals} decimales`);
    }

    const normalized = `${whole}${fraction.padEnd(decimals, '0')}`.replace(/^0+(?=\d)/, '');
    return BigInt(normalized || '0');
  }

  private extractSignatureFromError(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) {
      return undefined;
    }

    const candidate = error as {
      signature?: unknown;
      transactionSignature?: unknown;
      cause?: unknown;
    };

    if (typeof candidate.signature === 'string' && candidate.signature.length > 0) {
      return candidate.signature;
    }

    if (
      typeof candidate.transactionSignature === 'string' &&
      candidate.transactionSignature.length > 0
    ) {
      return candidate.transactionSignature;
    }

    return this.extractSignatureFromError(candidate.cause);
  }

  private async sendAndGetSignature(plan: unknown): Promise<string> {
    if (typeof plan === 'object' && plan !== null && typeof (plan as Record<string,unknown>).send === 'function') {
      const result = await (plan as { send: () => Promise<unknown> }).send();
      const r = result as Record<string,unknown>;
      return typeof result === 'string' ? result : (String(r.value ?? r.signature ?? ''));
    }
    return typeof plan === 'string' ? plan : '';
  }

  private hexToBytes32(value: string) {
    const normalized = value.toLowerCase().replace(/^0x/, '');
    if (!/^[0-9a-f]{64}$/.test(normalized)) {
      throw new Error('Se esperaba un hash hex de 32 bytes');
    }
    return Uint8Array.from(normalized.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)));
  }
}
