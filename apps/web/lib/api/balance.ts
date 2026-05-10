import { apiFetch } from '../api';

export interface WalletBalance {
  address: string;
  sol: { lamports: string; ui: string };
  usdc: { raw: string; ui: string; decimals: number };
}

export const balanceApi = {
  // Saldo on-chain (SOL + USDC) de la wallet vinculada al USER autenticado.
  // Requiere que tenga walletAddress en BD.
  getMyWallet: () => apiFetch<WalletBalance>('/users/me/wallet/balance'),

  // Saldo del ADMIN_KEYPAIR (treasury de desembolsos USDC). Solo ADMIN/RISK_ANALYST.
  getTreasury: () => apiFetch<WalletBalance>('/admin/treasury/balance'),
};
