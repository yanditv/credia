import { ExternalLink } from 'lucide-react';

const SOLANA_EXPLORER = 'https://explorer.solana.com';

const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet') as
  | 'mainnet'
  | 'devnet'
  | 'testnet';

interface TransactionLinkProps {
  signature: string;
  truncate?: boolean;
  className?: string;
}

export function TransactionLink({ signature, truncate = true, className }: TransactionLinkProps) {
  const display = truncate ? `${signature.slice(0, 8)}…${signature.slice(-6)}` : signature;
  const cluster = NETWORK === 'mainnet' ? 'mainnet-beta' : NETWORK;

  return (
    <a
      href={`${SOLANA_EXPLORER}/tx/${signature}?cluster=${cluster}`}
      target="_blank"
      rel="noopener noreferrer"
      title={signature}
      className={
        className ??
        'inline-flex items-center gap-1 font-mono text-xs text-blue-400 hover:text-blue-300 hover:underline'
      }
    >
      {display}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
