'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
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
import { BrandLogo } from '@/components/brand-logo';

interface AuthResponse {
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

export function SignupForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: { fullName, documentNumber, phone, email, password },
        withAuth: false,
      });

      const payload = decodeJwtPayload(res.accessToken);
      if (!payload) {
        throw new Error('Token recibido es inválido');
      }

      setSession({
        user: { id: payload.sub, email: payload.email, fullName, role: payload.role },
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });

      router.push('/onboarding');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error inesperado al crear la cuenta');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <BrandLogo priority imageClassName="h-9" className="mb-2" />
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Convertí tus ventas diarias en acceso a crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="María García"
                required
                minLength={2}
                maxLength={120}
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Cédula / RUC</Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="0123456789"
                  required
                  minLength={8}
                  maxLength={20}
                  disabled={loading}
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+593990000000"
                  required
                  minLength={8}
                  maxLength={20}
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@credia.io"
                required
                maxLength={120}
                disabled={loading}
                autoComplete="email"
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
                minLength={8}
                maxLength={100}
                disabled={loading}
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-500">Mínimo 8 caracteres</p>
            </div>

            {error ? (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Crear cuenta
            </Button>

            <p className="text-center text-xs text-slate-500">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="font-medium text-green-400 hover:text-green-300">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
