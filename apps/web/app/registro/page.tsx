import { Suspense } from 'react';
import { SignupForm } from './signup-form';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Cargando…
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
