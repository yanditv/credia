import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { AnchorProvider, Program, Wallet, web3 } from '@coral-xyz/anchor';

const { Keypair, Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } = web3;
const ADMIN_KEYPAIR_PATH = process.env.ADMIN_KEYPAIR_PATH ?? '/Users/famitry/.config/solana/id.json';
const TEST_PROGRAM_ID = process.env.CREDIA_TEST_PROGRAM_ID ?? 'DWaMz9AuWiQZ2VD4NrWNxMCC2AUkmZ8to4e5SrPEfBK6';
const IDL = {
  address: TEST_PROGRAM_ID,
  metadata: { name: 'credia_reputation', version: '0.1.0', spec: '0.1.0' },
  instructions: [
    {
      name: 'init_reputation',
      discriminator: [236, 239, 233, 112, 220, 149, 26, 175],
      accounts: [
        { name: 'user_reputation', writable: true },
        { name: 'authority', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [{ name: 'score_hash', type: { array: ['u8', 32] } }],
    },
    {
      name: 'update_score_hash',
      discriminator: [145, 224, 33, 238, 94, 228, 227, 122],
      accounts: [
        { name: 'target_wallet' },
        { name: 'user_reputation', writable: true },
        { name: 'admin', signer: true },
      ],
      args: [
        { name: 'score_hash', type: { array: ['u8', 32] } },
        { name: 'status', type: { defined: { name: 'ReputationStatus' } } },
      ],
    },
    {
      name: 'create_loan_record',
      discriminator: [79, 46, 198, 203, 2, 203, 76, 51],
      accounts: [
        { name: 'target_wallet' },
        { name: 'loan_record', writable: true },
        { name: 'admin', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [
        { name: 'loan_id_hash', type: { array: ['u8', 32] } },
        { name: 'amount_hash', type: { array: ['u8', 32] } },
      ],
    },
    {
      name: 'register_payment',
      discriminator: [217, 221, 73, 251, 248, 92, 214, 33],
      accounts: [
        { name: 'payment_record', writable: true },
        { name: 'loan_record', writable: true },
        { name: 'authority', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [
        { name: 'payment_hash', type: { array: ['u8', 32] } },
        { name: 'amount_hash', type: { array: ['u8', 32] } },
      ],
    },
    {
      name: 'close_loan',
      discriminator: [96, 114, 111, 204, 149, 228, 235, 124],
      accounts: [
        { name: 'target_wallet' },
        { name: 'loan_record', writable: true },
        { name: 'admin', signer: true },
      ],
      args: [],
    },
    {
      name: 'mark_default',
      discriminator: [182, 231, 123, 132, 66, 208, 137, 139],
      accounts: [
        { name: 'target_wallet' },
        { name: 'loan_record', writable: true },
        { name: 'admin', signer: true },
      ],
      args: [],
    },
  ],
  types: [
    {
      name: 'ReputationStatus',
      type: {
        kind: 'enum',
        variants: [{ name: 'Pending' }, { name: 'Active' }, { name: 'Suspended' }],
      },
    },
  ],
} as const;

function hash32(label: string): number[] {
  return Array.from(createHash('sha256').update(label).digest());
}

async function loadAdminKeypair() {
  const raw = await readFile(ADMIN_KEYPAIR_PATH, 'utf8');
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw) as number[]));
}

async function loadProgram() {
  const admin = await loadAdminKeypair();
  const provider = new AnchorProvider(
    new Connection('https://api.devnet.solana.com', 'confirmed'),
    new Wallet(admin),
    { commitment: 'confirmed' },
  );
  return {
    admin,
    provider,
    program: new Program(IDL as never, provider) as Program,
  };
}

async function fundUser(provider: AnchorProvider, admin: web3.Keypair, user: web3.Keypair) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: admin.publicKey,
      toPubkey: user.publicKey,
        lamports: Math.floor(0.01 * LAMPORTS_PER_SOL),
    }),
  );
  await provider.sendAndConfirm(tx, [admin]);
}

test('happy path por instruccion en devnet', async () => {
  const { admin, provider, program } = await loadProgram();
  const user = Keypair.generate();
  await fundUser(provider, admin, user);

  const [userReputation] = PublicKey.findProgramAddressSync(
    [Buffer.from('reputation'), user.publicKey.toBuffer()],
    program.programId,
  );

  await program.methods
    .initReputation(hash32(`score-${Date.now()}`))
    .accounts({
      userReputation,
      authority: user.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc();

  const repInfo = await provider.connection.getAccountInfo(userReputation, 'confirmed');
  assert.ok(repInfo, 'UserReputation PDA debe existir');

  await program.methods
    .updateScoreHash(hash32(`score-next-${Date.now()}`), { active: {} })
    .accounts({
      targetWallet: user.publicKey,
      userReputation,
      admin: admin.publicKey,
    })
    .rpc();

  const loan1Hash = hash32(`loan-1-${Date.now()}`);
  const [loanRecord1] = PublicKey.findProgramAddressSync(
    [Buffer.from('loan'), user.publicKey.toBuffer(), Buffer.from(loan1Hash)],
    program.programId,
  );

  await program.methods
    .createLoanRecord(loan1Hash, hash32('amount-1'))
    .accounts({
      targetWallet: user.publicKey,
      loanRecord: loanRecord1,
      admin: admin.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const paymentHash = hash32(`payment-${Date.now()}`);
  const [paymentRecord] = PublicKey.findProgramAddressSync(
    [Buffer.from('payment'), loanRecord1.toBuffer(), Buffer.from(paymentHash)],
    program.programId,
  );

  await program.methods
    .registerPayment(paymentHash, hash32('payment-amount-1'))
    .accounts({
      paymentRecord,
      loanRecord: loanRecord1,
      authority: user.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc();

  const paymentInfo = await provider.connection.getAccountInfo(paymentRecord, 'confirmed');
  assert.ok(paymentInfo, 'PaymentRecord PDA debe existir');

  const loan2Hash = hash32(`loan-2-${Date.now()}`);
  const [loanRecord2] = PublicKey.findProgramAddressSync(
    [Buffer.from('loan'), user.publicKey.toBuffer(), Buffer.from(loan2Hash)],
    program.programId,
  );

  await program.methods
    .createLoanRecord(loan2Hash, hash32('amount-2'))
    .accounts({
      targetWallet: user.publicKey,
      loanRecord: loanRecord2,
      admin: admin.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  await program.methods
    .closeLoan()
    .accounts({ targetWallet: user.publicKey, loanRecord: loanRecord2, admin: admin.publicKey })
    .rpc();

  const loan3Hash = hash32(`loan-3-${Date.now()}`);
  const [loanRecord3] = PublicKey.findProgramAddressSync(
    [Buffer.from('loan'), user.publicKey.toBuffer(), Buffer.from(loan3Hash)],
    program.programId,
  );

  await program.methods
    .createLoanRecord(loan3Hash, hash32('amount-3'))
    .accounts({
      targetWallet: user.publicKey,
      loanRecord: loanRecord3,
      admin: admin.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  await program.methods
    .markDefault()
    .accounts({ targetWallet: user.publicKey, loanRecord: loanRecord3, admin: admin.publicKey })
    .rpc();

  assert.ok(true);
});
