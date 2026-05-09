'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

// Redirige según rol:
// - sin sesión → /login
// - role USER → /mi-perfil
// - role ADMIN o RISK_ANALYST → /admin/dashboard
export default function HomePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken) {
      router.replace('/login');
      return;
    }
    router.replace(role === 'USER' ? '/mi-perfil' : '/admin/dashboard');
  }, [_hasHydrated, accessToken, role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Redirigiendo…
      </div>
    </div>
  );
}
