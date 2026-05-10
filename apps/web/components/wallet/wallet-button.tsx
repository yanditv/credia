'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [connectingName, setConnectingName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const connectedWallet = useWalletStore((s) => s.connectedWallet);
  const sessionAddress = useWalletStore((s) => s.walletAddress);
  const walletName = useWalletStore((s) => s.walletName);
  const setConnected = useWalletStore((s) => s.setConnected);
  const clear = useWalletStore((s) => s.clear);

  const setWalletAddress = useAuthStore((s) => s.setWalletAddress);
  const userWalletAddress = useAuthStore((s) => s.user?.walletAddress);

  // El wallet store no se persiste (Wallet Standard requiere reauthorización
  // por sesión), así que tras un reload sessionAddress es null pero el address
  // ya está vinculado en BD via auth-store. Mostramos ese fallback para que el
  // user no vea "Conectar wallet" cada vez que recarga.
  const walletAddress = sessionAddress ?? userWalletAddress ?? null;
  const isLiveSession = Boolean(sessionAddress);

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
      // Refresca el meQuery para que la UI que depende de
      // /users/me (mi-perfil, solicitar-credito) vea la wallet vinculada
      // sin necesidad de recargar la página.
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      // Y el balance de la wallet recién conectada (puede ya tener fondos).
      qc.invalidateQueries({ queryKey: ['wallet-balance', 'me'] });
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
    const borderClass = isLiveSession
      ? 'border-green-500/20 bg-green-500/5'
      : 'border-slate-700 bg-slate-800/40';
    const iconClass = isLiveSession ? 'text-green-400' : 'text-slate-400';
    const textClass = isLiveSession ? 'text-green-100' : 'text-slate-200';

    return (
      <div className={`flex items-center gap-1 rounded-lg border pl-3 ${borderClass}`}>
        <WalletIcon className={`h-4 w-4 ${iconClass}`} />
        <span
          className={`font-mono text-sm ${textClass}`}
          title={`${walletName ?? 'Wallet vinculada'} · ${walletAddress}${isLiveSession ? '' : ' · sesión inactiva — reconectá para firmar'}`}
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
        {!isLiveSession ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            aria-label="Reconectar wallet"
            title="Reconectar para poder firmar transacciones"
            className="inline-flex h-8 items-center px-2 text-xs text-slate-400 transition-colors hover:text-green-300"
          >
            Reconectar
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleDisconnect}
          aria-label="Desconectar wallet"
          className="inline-flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
        <WalletModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={handleSelect}
          connectingName={connectingName}
        />
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
