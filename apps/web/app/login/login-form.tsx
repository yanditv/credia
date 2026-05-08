'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api';
import { useAuthStore, type AuthUser } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: AuthUser['role'];
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  const redirectTo = searchParams.get('redirect') ?? '/admin/dashboard';

  const [email, setEmail] = useState('admin@credia.io');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
        withAuth: false,
      });

      const payload = decodeJwtPayload(res.accessToken);
      if (!payload) {
        throw new Error('Token recibido es inválido');
      }

      setSession({
        user: { id: payload.sub, email: payload.email, role: payload.role },
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });

      router.push(redirectTo);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error inesperado al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              ●
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-100">Credia</span>
          </div>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Acceso al panel de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@credia.io"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {error ? (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Entrar
            </Button>

            <p className="text-center text-xs text-slate-500">
              Demo: <code className="font-mono">admin@credia.io</code> / <code className="font-mono">demo1234</code>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}