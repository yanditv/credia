import { apiFetch } from '../api';

interface ConnectWalletResponse {
  id: string;
  walletAddress: string;
}

export const walletApi = {
  link: (walletAddress: string) =>
    apiFetch<ConnectWalletResponse>('/users/me/wallet', {
      method: 'POST',
      body: { walletAddress },
    }),
};
