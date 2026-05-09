'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/ui-store';
import { NAV_ITEMS } from './nav-items';

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);

  // Cierra el drawer al navegar (cambio de pathname).
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  // Bloquea scroll del body cuando el drawer está abierto en mobile.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Backdrop solo en mobile cuando está abierto */}
      <div
        aria-hidden
        onClick={closeSidebar}
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition-opacity md:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-200',
          'md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-800 px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              ●
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-100">Credia</span>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
          <p className="text-xs text-slate-500">Solana Devnet · v0.1.0</p>
        </div>
      </aside>
    </>
  );
}
