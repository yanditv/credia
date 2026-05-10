'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useUiStore } from '@/lib/ui-store';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/wallet/wallet-button';
import { WalletBalanceCard } from '@/components/wallet/wallet-balance';

export function Topbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openSidebar = useUiStore((s) => s.openSidebar);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/40 px-4 sm:px-6">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <button
          type="button"
          onClick={openSidebar}
          aria-label="Abrir menú"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden font-medium text-slate-200 md:inline">Panel administrativo</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* USER ve botón de su wallet personal. ADMIN/RISK_ANALYST ven el saldo
            del treasury (ADMIN_KEYPAIR) — útil para detectar si se queda sin USDC
            antes de un disbursement (ver feature flag de PR #48). */}
        {user?.role === 'USER' ? (
          <WalletButton />
        ) : user?.role ? (
          <WalletBalanceCard source="treasury" variant="compact" label="Treasury" />
        ) : null}

        <div className="hidden items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-1.5 text-sm sm:flex">
          <UserIcon className="h-4 w-4 text-slate-400" />
          <span className="text-slate-200">{user?.email ?? '—'}</span>
          <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-400">
            {user?.role ?? '—'}
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  );
}
