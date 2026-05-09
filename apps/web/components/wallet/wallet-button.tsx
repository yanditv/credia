'use client';

import { useState } from 'react';
import { Check, Copy, LogOut, Wallet as WalletIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import { walletApi } from '@/lib/api/wallet';
import { ApiError } from '@/lib/api';
import {
  type DetectedWallet,
  connectWallet as standardConnect,
  disconnectWallet as standardDisconnect,
} from '@/lib/wallet/standard';
import { truncateAddress, useWalletStore } from '@/lib/wallet/store';
import { WalletModal } from './wallet-modal';

export function WalletButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [connectingName, setConnectingName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const connectedWallet = useWalletStore((s) => s.connectedWallet);
  const walletAddress = useWalletStore((s) => s.walletAddress);
  const walletName = useWalletStore((s) => s.walletName);
  const setConnected = useWalletStore((s) => s.setConnected);
  const clear = useWalletStore((s) => s.clear);

  const setWalletAddress = useAuthStore((s) => s.setWalletAddress);
  const userWalletAddress = useAuthStore((s) => s.user?.walletAddress);

  async function handleSelect(detected: DetectedWallet) {
    setConnectingName(detected.name);
    try {
      const result = await standardConnect(detected.wallet);
      const isReplacing = Boolean(userWalletAddress) && userWalletAddress !== result.address;

      try {
        await walletApi.link(result.address);
      } catch (err) {
        if (err instanceof ApiError && err.status !== 409) throw err;
      }

      setConnected({
        wallet: detected.wallet,
        address: result.address,
        name: result.walletName,
      });
      setWalletAddress(result.address);
      setModalOpen(false);

      if (isReplacing) {
        toast.success(`Wallet actualizada a ${result.walletName}`, {
          description: `Reemplazó ${truncateAddress(userWalletAddress!)} → ${truncateAddress(result.address)}`,
        });
      } else {
        toast.success(`${result.walletName} conectada`, {
          description: truncateAddress(result.address, 6, 6),
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al conectar wallet';
      toast.error(message);
    } finally {
      setConnectingName(null);
    }
  }

  async function handleDisconnect() {
    if (connectedWallet) {
      await standardDisconnect(connectedWallet).catch(() => {});
    }
    clear();
    toast.message('Wallet desconectada');
  }

  async function handleCopy() {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('No se pudo copiar al portapapeles');
    }
  }

  if (walletAddress) {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/5 pl-3">
        <WalletIcon className="h-4 w-4 text-green-400" />
        <span
          className="font-mono text-sm text-green-100"
          title={`${walletName ?? 'Wallet'} · ${walletAddress}`}
        >
          {truncateAddress(walletAddress)}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar dirección"
          className="inline-flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:text-green-300"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={handleDisconnect}
          aria-label="Desconectar wallet"
          className="inline-flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
        <WalletIcon className="h-4 w-4" />
        Conectar wallet
      </Button>
      <WalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelect}
        connectingName={connectingName}
      />
    </>
  );
}

