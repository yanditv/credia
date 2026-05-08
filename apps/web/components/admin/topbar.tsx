'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';

export function Topbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/40 px-6">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="hidden font-medium text-slate-200 md:inline">Panel administrativo</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-1.5 text-sm">
          <UserIcon className="h-4 w-4 text-slate-400" />
          <span className="text-slate-200">{user?.email ?? '—'}</span>
          <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-400">
            {user?.role ?? '—'}
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}
