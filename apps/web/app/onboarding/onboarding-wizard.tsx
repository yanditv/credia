'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Check, Briefcase, Wallet, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { businessProfileApi } from '@/lib/api/business-profile';
import { useAuthStore } from '@/lib/auth-store';
import { useWalletStore } from '@/lib/wallet/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WalletButton } from '@/components/wallet/wallet-button';
import { BrandLogo } from '@/components/brand-logo';
import type { BusinessType } from '@/lib/api-types';

type Step = 1 | 2 | 3;

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  VENDOR: 'Vendedor / Puesto ambulante',
  MERCHANT: 'Comerciante',
  DELIVERY: 'Repartidor',
  TAXI: 'Taxista / Motorizado',
  STORE: 'Tienda / Local',
  SERVICES: 'Servicios',
  AGRICULTURE: 'Agricultura',
  OTHER: 'Otro',
};

const STEPS: { id: Step; label: string; icon: typeof Briefcase }[] = [
  { id: 1, label: 'Negocio', icon: Briefcase },
  { id: 2, label: 'Wallet', icon: Wallet },
  { id: 3, label: 'Listo', icon: Sparkles },
];

export function OnboardingWizard() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const walletAddress = useWalletStore((s) => s.walletAddress);

  const [step, setStep] = useState<Step>(1);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('VENDOR');
  const [city, setCity] = useState('');
  const [monthlyEstimatedIncome, setMonthlyEstimatedIncome] = useState('');
  const [yearsActive, setYearsActive] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.replace('/login?redirect=/onboarding');
    }
  }, [hasHydrated, accessToken, router]);

  const profileQuery = useQuery({
    queryKey: ['business-profile', 'me'],
    queryFn: () => businessProfileApi.getMine(),
    enabled: Boolean(accessToken),
    staleTime: 0,
  });

  // Si el user ya tiene business profile, saltamos el step 1.
  // Patrón "derived state during render" (React docs: Adjusting state on prop change).
  const [autoAdvanced, setAutoAdvanced] = useState(false);
  if (profileQuery.data && !autoAdvanced) {
    setAutoAdvanced(true);
    setStep(2);
  }

  async function handleStep1(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await businessProfileApi.create({
        businessName,
        businessType,
        city,
        monthlyEstimatedIncome,
        yearsActive: Number(yearsActive),
      });
      toast.success('Perfil de negocio creado');
      setStep(2);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Error al guardar el perfil';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!hasHydrated || profileQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Cargando…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex justify-center">
          <BrandLogo imageClassName="h-9" />
        </div>
        <Stepper currentStep={step} />

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Contanos sobre tu negocio</CardTitle>
              <CardDescription>
                Estos datos arman la base de tu score financiero
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del negocio</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Frutería La Mariscal"
                    required
                    minLength={2}
                    maxLength={120}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Tipo de actividad</Label>
                  <Select
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    disabled={submitting}
                  >
                    {(Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]).map((t) => (
                      <option key={t} value={t}>
                        {BUSINESS_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Quito"
                      required
                      minLength={2}
                      maxLength={80}
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsActive">Años activo</Label>
                    <Input
                      id="yearsActive"
                      type="number"
                      min={0}
                      max={80}
                      value={yearsActive}
                      onChange={(e) => setYearsActive(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyEstimatedIncome">Ingreso mensual estimado (USD)</Label>
                  <Input
                    id="monthlyEstimatedIncome"
                    type="text"
                    inputMode="decimal"
                    value={monthlyEstimatedIncome}
                    onChange={(e) => setMonthlyEstimatedIncome(e.target.value)}
                    placeholder="450.00"
                    required
                    pattern="[0-9]+([.][0-9]{1,2})?"
                    disabled={submitting}
                  />
                </div>

                {error ? (
                  <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {error}
                  </div>
                ) : null}

                <Button type="submit" loading={submitting} className="w-full" size="lg">
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>Conectá tu wallet Solana (opcional)</CardTitle>
              <CardDescription>
                La usaremos para registrar tu reputación on-chain y desembolsar créditos en USDC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-6">
                <WalletButton />
                {walletAddress ? (
                  <p className="text-xs text-green-400">
                    <Check className="mr-1 inline-block h-3 w-3" /> Wallet vinculada
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">Soporta Phantom y Solflare</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(3)}>
                  Saltar por ahora
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!walletAddress}>
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <CardHeader>
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <CardTitle>¡Bienvenido a Credia!</CardTitle>
              <CardDescription>
                Tu cuenta y perfil de negocio están listos. Empezá registrando tus
                ventas diarias para construir tu score.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push('/mis-ventas')}
              >
                <Check className="mr-2 h-4 w-4" />
                Registrar mi primera venta
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                size="lg"
                onClick={() => router.push('/mi-perfil')}
              >
                Ir a mi perfil
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: Step }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = currentStep > s.id;
        const active = currentStep === s.id;
        return (
          <div key={s.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? 'border-green-500 bg-green-500 text-white'
                    : active
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-slate-700 bg-slate-900 text-slate-500'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider ${
                  active ? 'text-green-400' : done ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <span
                className={`h-px w-8 sm:w-16 ${currentStep > s.id ? 'bg-green-500' : 'bg-slate-700'}`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
