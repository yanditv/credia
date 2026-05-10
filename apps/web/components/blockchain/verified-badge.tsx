import { ShieldCheck } from 'lucide-react';
import { TransactionLink } from './transaction-link';

interface SolanaVerifiedBadgeProps {
  signature: string | null;
  pendingLabel?: string;
}

export function SolanaVerifiedBadge({
  signature,
  pendingLabel = 'Sin registrar',
}: SolanaVerifiedBadgeProps) {
  if (!signature) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/40 px-2 py-0.5 text-xs text-slate-500">
        {pendingLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-0.5 text-xs text-green-300 ring-1 ring-inset ring-green-500/20">
      <ShieldCheck className="h-3 w-3" />
      <span>On-chain</span>
      <span className="text-slate-500">·</span>
      <TransactionLink
        signature={signature}
        className="font-mono text-green-200 hover:text-green-100 hover:underline"
      />
    </span>
  );
}
