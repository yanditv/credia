// Wrappers sobre @wallet-standard/app para detectar y conectar wallets que
// implementan Wallet Standard. Phantom y Solflare lo implementan nativamente.
//
// El skill `solana-dev` recomienda Wallet Standard sobre wallet-adapter clásico
// porque evita el peso de @solana/wallet-adapter-* y funciona con cualquier
// wallet que cumpla el spec (no solo Phantom/Solflare).

import { getWallets } from '@wallet-standard/app';
import type { Wallet, WalletAccount } from '@wallet-standard/base';

export const SOLANA_DEVNET_CHAIN = 'solana:devnet';
export const SOLANA_MAINNET_CHAIN = 'solana:mainnet';

export interface DetectedWallet {
  name: string;
  icon: string;
  wallet: Wallet;
}

export interface ConnectResult {
  address: string;
  walletName: string;
  account: WalletAccount;
}

function supportsSolana(wallet: Wallet): boolean {
  return wallet.chains.some((c) => c.startsWith('solana:'));
}

export function listSolanaWallets(): DetectedWallet[] {
  if (typeof window === 'undefined') return [];
  return getWallets()
    .get()
    .filter(supportsSolana)
    .map((wallet) => ({
      name: wallet.name,
      icon: wallet.icon,
      wallet,
    }));
}

export function onWalletsChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const { on } = getWallets();
  const offRegister = on('register', callback);
  const offUnregister = on('unregister', callback);
  return () => {
    offRegister();
    offUnregister();
  };
}

export async function connectWallet(wallet: Wallet): Promise<ConnectResult> {
  const connectFeature = wallet.features['standard:connect'] as
    | { connect: () => Promise<{ accounts: readonly WalletAccount[] }> }
    | undefined;

  if (!connectFeature) {
    throw new Error(`${wallet.name} no implementa standard:connect`);
  }

  const { accounts } = await connectFeature.connect();
  if (accounts.length === 0) {
    throw new Error(`${wallet.name} no devolvió ninguna cuenta`);
  }

  const account = accounts[0];
  return {
    address: account.address,
    walletName: wallet.name,
    account,
  };
}

export async function disconnectWallet(wallet: Wallet): Promise<void> {
  const disconnectFeature = wallet.features['standard:disconnect'] as
    | { disconnect: () => Promise<void> }
    | undefined;

  if (!disconnectFeature) return;
  await disconnectFeature.disconnect();
}
