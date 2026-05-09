import { ExternalLink } from 'lucide-react';

const SOLANA_EXPLORER = 'https://explorer.solana.com';

const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet') as
  | 'mainnet'
  | 'devnet'
  | 'testnet';

interface AddressLinkProps {
  address: string;
  truncate?: boolean;
  className?: string;
}

export function AddressLink({ address, truncate = true, className }: AddressLinkProps) {
  const display = truncate ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
  const cluster = NETWORK === 'mainnet' ? 'mainnet-beta' : NETWORK;

  return (
    <a
      href={`${SOLANA_EXPLORER}/address/${address}?cluster=${cluster}`}
      target="_blank"
      rel="noopener noreferrer"
      title={address}
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
