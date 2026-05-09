'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Loader2, X } from 'lucide-react';
import {
  type DetectedWallet,
  listSolanaWallets,
  onWalletsChange,
} from '@/lib/wallet/standard';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (wallet: DetectedWallet) => Promise<void> | void;
  connectingName: string | null;
}

export function WalletModal({ open, onClose, onSelect, connectingName }: WalletModalProps) {
  // Inicialización vía lazy state — listSolanaWallets() corre una vez al
  // mount. La suscripción a Wallet Standard mantiene la lista al día si
  // el user instala una wallet con la app abierta. Evita setState síncrono
  // dentro del effect (react-hooks/set-state-in-effect).
  const [wallets, setWallets] = useState<DetectedWallet[]>(listSolanaWallets);

  useEffect(() => {
    return onWalletsChange(() => {
      setWallets(listSolanaWallets());
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 id="wallet-modal-title" className="text-lg font-semibold text-slate-100">
          Conectar wallet
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Elegí tu wallet de Solana para vincularla a tu cuenta
        </p>

        <div className="mt-5 space-y-2">
          {wallets.length === 0 ? (
            <EmptyWallets />
          ) : (
            wallets.map((w) => (
              <button
                key={w.name}
                type="button"
                onClick={() => onSelect(w)}
                disabled={connectingName !== null}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-left transition-colors hover:border-green-500/40 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Image
                  src={w.icon}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-lg"
                  unoptimized
                />
                <span className="flex-1 font-medium text-slate-100">{w.name}</span>
                {connectingName === w.name ? (
                  <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                ) : (
                  <span className="text-xs text-slate-500 group-hover:text-green-400">
                    Conectar
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <p className="mt-5 text-xs text-slate-500">
          Solo se guarda la dirección pública on-chain. Nunca pedimos tu seed phrase ni tu clave
          privada.
        </p>
      </div>
    </div>
  );
}

function EmptyWallets() {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
      <p className="text-sm font-medium text-slate-200">No detectamos ninguna wallet</p>
      <p className="mt-1 text-xs text-slate-400">
        Instalá Phantom o Solflare para vincular una wallet a tu cuenta.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <a
          href="https://phantom.com/download"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60"
        >
          Phantom <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href="https://solflare.com/download"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60"
        >
          Solflare <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
