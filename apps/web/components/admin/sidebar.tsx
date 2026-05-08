'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './nav-items';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-slate-800 bg-slate-900 md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
          ●
        </span>
        <span className="text-lg font-bold tracking-tight text-slate-100">Credia</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-2 border-green-500 bg-green-500/10 pl-[10px] text-green-400'
                  : 'border-l-2 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300',
                )}
              />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        <p className="text-xs text-slate-500">
          Solana Devnet · v0.1.0
        </p>
      </div>
    </aside>
  );
}
