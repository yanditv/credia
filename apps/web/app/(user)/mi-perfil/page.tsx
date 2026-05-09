'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, FileText, Briefcase, MapPin, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonCard } from '@/components/ui/skeleton';
import { WalletButton } from '@/components/wallet/wallet-button';
import { usersApi } from '@/lib/api/users';
import { businessProfileApi } from '@/lib/api/business-profile';
import { formatUsdc, formatDate } from '@/lib/format';
import { useAuthStore } from '@/lib/auth-store';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  VENDOR: 'Vendedor / Puesto ambulante',
  MERCHANT: 'Comerciante',
  DELIVERY: 'Repartidor',
  TAXI: 'Taxista / Motorizado',
  STORE: 'Tienda / Local',
  SERVICES: 'Servicios',
  AGRICULTURE: 'Agricultura',
  OTHER: 'Otro',
};

export default function MiPerfilPage() {
  const setWalletAddress = useAuthStore((s) => s.setWalletAddress);

  const meQuery = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.getMe(),
  });

  const profileQuery = useQuery({
    queryKey: ['business-profile', 'me'],
    queryFn: () => businessProfileApi.getMine(),
  });

  // Mantener el walletAddress del store en sync con el server (en caso de
  // que haya cambiado en otra pestaña).
  useEffect(() => {
    if (meQuery.data) {
      setWalletAddress(meQuery.data.walletAddress);
    }
  }, [meQuery.data, setWalletAddress]);

  const isLoading = meQuery.isLoading || profileQuery.isLoading;
  const error = meQuery.error ?? profileQuery.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Mi perfil</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tus datos personales, negocio y wallet asociada
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonCard height={220} />
          <SkeletonCard height={220} />
        </div>
      ) : error ? (
        <ErrorState
          title="Error al cargar el perfil"
          error={error}
          onRetry={() => {
            meQuery.refetch();
            profileQuery.refetch();
          }}
        />
      ) : meQuery.data ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos personales</CardTitle>
              <CardDescription>Cuenta creada el {formatDate(meQuery.data.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-200">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="font-medium">{meQuery.data.fullName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="h-4 w-4 text-slate-500" />
                {meQuery.data.email}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4 text-slate-500" />
                {meQuery.data.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="font-mono text-xs">{meQuery.data.documentNumber}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge tone="blue">{meQuery.data.role}</Badge>
                <Badge tone={meQuery.data.status === 'ACTIVE' ? 'green' : 'amber'}>
                  {meQuery.data.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mi negocio</CardTitle>
              <CardDescription>Datos que arman tu score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profileQuery.data ? (
                <>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">{profileQuery.data.businessName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-xs text-slate-500">Tipo</span>
                    <span>{BUSINESS_TYPE_LABELS[profileQuery.data.businessType] ?? profileQuery.data.businessType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {profileQuery.data.city}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-xs text-slate-500">Ingreso mensual</span>
                    <span className="font-mono">{formatUsdc(profileQuery.data.monthlyEstimatedIncome)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-xs text-slate-500">Antigüedad</span>
                    <span>{profileQuery.data.yearsActive} años</span>
                  </div>
                </>
              ) : (
                <p className="text-sm italic text-slate-500">
                  Aún no completaste tu perfil de negocio.{' '}
                  <a href="/onboarding" className="text-green-400 hover:text-green-300">
                    Completalo ahora
                  </a>
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Wallet Solana</CardTitle>
              <CardDescription>Para registrar tu reputación on-chain y recibir USDC</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Wallet className="h-4 w-4 text-slate-500" />
                <WalletButton />
                {meQuery.data.walletAddress ? (
                  <span className="font-mono text-xs text-slate-400">
                    {meQuery.data.walletAddress}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">No vinculada</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
