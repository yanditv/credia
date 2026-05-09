'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth-store';

// Stub temporal hasta el merge de #44 (J2 — onboarding wizard).
// Render estático sin redirect: en develop el home redirige authed → /admin/dashboard
// (no es role-aware todavía — eso lo trae #45/J3), así que un bounce automático
// sacaría al USER recién creado al panel admin. Mejor mostrar bienvenida y esperar
// a que J2 reemplace este archivo con el wizard real.
export default function OnboardingStubPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-100">Credia</span>
          </div>
          <CardTitle>Tu cuenta fue creada</CardTitle>
          <CardDescription>
            Estamos terminando de configurar el onboarding de Credia. En breve vas a poder
            completar tu perfil de negocio y registrar tus ventas para construir tu score.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-400">
            Mientras tanto, podés cerrar sesión y volver más tarde. Tus datos ya quedaron
            guardados.
          </p>
          <Button variant="ghost" onClick={handleLogout} className="w-full">
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
