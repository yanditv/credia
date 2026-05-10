// Store de wallet conectada (no persistido — la sesión de wallet se recrea
// cada page load por security model de Wallet Standard). El walletAddress
// vinculado en BD vive en auth-store; este es solo el estado de la sesión
// actual del browser.

import { create } from 'zustand';
import type { Wallet } from '@wallet-standard/base';

interface WalletState {
  connectedWallet: Wallet | null;
  walletAddress: string | null;
  walletName: string | null;
  isConnecting: boolean;
  setConnected: (params: { wallet: Wallet; address: string; name: string }) => void;
  setConnecting: (state: boolean) => void;
  clear: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  connectedWallet: null,
  walletAddress: null,
  walletName: null,
  isConnecting: false,
  setConnected: ({ wallet, address, name }) =>
    set({
      connectedWallet: wallet,
      walletAddress: address,
      walletName: name,
      isConnecting: false,
    }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  clear: () =>
    set({
      connectedWallet: null,
      walletAddress: null,
      walletName: null,
      isConnecting: false,
    }),
}));

export function truncateAddress(address: string, leading = 4, trailing = 4): string {
  if (address.length <= leading + trailing + 3) return address;
  return `${address.slice(0, leading)}…${address.slice(-trailing)}`;
}
