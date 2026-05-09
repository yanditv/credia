'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Stub temporal hasta el merge de #44 (J2 — onboarding wizard).
// Mientras J2 no esté en develop, el flujo de signup termina acá y rebota a /.
export default function OnboardingStubPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Bienvenido a Credia…
      </div>
    </div>
  );
}
