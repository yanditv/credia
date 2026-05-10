'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, FileText, Briefcase, MapPin, Wallet, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonCard } from '@/components/ui/skeleton';
import { WalletButton } from '@/components/wallet/wallet-button';
import { usersApi, type UpdateUserPayload } from '@/lib/api/users';
import { businessProfileApi, type BusinessProfile, type CreateBusinessProfilePayload } from '@/lib/api/business-profile';
import { formatUsdc, formatDate } from '@/lib/format';
import { useAuthStore } from '@/lib/auth-store';
import type { BusinessType, UserMe } from '@/lib/api-types';

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
  const qc = useQueryClient();
  const setWalletAddress = useAuthStore((s) => s.setWalletAddress);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(false);

  const meQuery = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.getMe(),
  });

  const profileQuery = useQuery({
    queryKey: ['business-profile', 'me'],
    queryFn: () => businessProfileApi.getMine(),
  });

  useEffect(() => {
    if (meQuery.data) {
      setWalletAddress(meQuery.data.walletAddress);
    }
  }, [meQuery.data, setWalletAddress]);

  const updateMe = useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.updateMe(payload),
    onSuccess: () => {
      toast.success('Perfil actualizado');
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      setEditingPersonal(false);
    },
    onError: (err: Error) => toast.error(err.message || 'Error al actualizar perfil'),
  });

  const updateBusiness = useMutation({
    mutationFn: (payload: Partial<CreateBusinessProfilePayload>) =>
      businessProfileApi.update(payload),
    onSuccess: () => {
      toast.success('Negocio actualizado');
      qc.invalidateQueries({ queryKey: ['business-profile', 'me'] });
      setEditingBusiness(false);
    },
    onError: (err: Error) => toast.error(err.message || 'Error al actualizar negocio'),
  });

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
          onRetry={() => { meQuery.refetch(); profileQuery.refetch(); }}
        />
      ) : meQuery.data ? (
        <div className="grid gap-4 md:grid-cols-2">
          <PersonalCard
            user={meQuery.data}
            editing={editingPersonal}
            onEdit={() => setEditingPersonal(true)}
            onCancel={() => setEditingPersonal(false)}
            onSave={(payload) => updateMe.mutate(payload)}
            loading={updateMe.isPending}
          />
              {profileQuery.data ? (
                <BusinessCard
                  profile={profileQuery.data}
                  editing={editingBusiness}
                  onEdit={() => setEditingBusiness(true)}
                  onCancel={() => setEditingBusiness(false)}
                  onSave={(payload) => updateBusiness.mutate(payload)}
                  loading={updateBusiness.isPending}
                />
              ) : (
                <BusinessCard
                  profile={null}
                  editing={editingBusiness}
                  onEdit={() => setEditingBusiness(true)}
                  onCancel={() => setEditingBusiness(false)}
                  onSave={(payload) => updateBusiness.mutate(payload)}
                  loading={updateBusiness.isPending}
                />
              )}
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

function PersonalCard({
  user,
  editing,
  onEdit,
  onCancel,
  onSave,
  loading,
}: {
  user: UserMe;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (payload: UpdateUserPayload) => void;
  loading: boolean;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave({ fullName, email, phone });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Datos personales</CardTitle>
            <CardDescription>Cuenta creada el {formatDate(user.createdAt)}</CardDescription>
          </div>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="mr-1 h-4 w-4" />
              Editar
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
                maxLength={120}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={120}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                minLength={8}
                maxLength={20}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" loading={loading} size="sm">
                <Save className="mr-1 h-4 w-4" />
                Guardar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-200">
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="font-medium">{user.fullName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="h-4 w-4 text-slate-500" />
              {user.email}
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="h-4 w-4 text-slate-500" />
              {user.phone}
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="font-mono text-xs">{user.documentNumber}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge tone="blue">{user.role}</Badge>
              <Badge tone={user.status === 'ACTIVE' ? 'green' : 'amber'}>{user.status}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BusinessCard({
  profile,
  editing,
  onEdit,
  onCancel,
  onSave,
  loading,
}: {
  profile: BusinessProfile | null | undefined;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (payload: Partial<CreateBusinessProfilePayload>) => void;
  loading: boolean;
}) {
  const [businessName, setBusinessName] = useState(profile?.businessName ?? '');
  const [businessType, setBusinessType] = useState(profile?.businessType ?? 'VENDOR' as BusinessType);
  const [city, setCity] = useState(profile?.city ?? '');
  const [monthlyEstimatedIncome, setMonthlyEstimatedIncome] = useState(profile?.monthlyEstimatedIncome ?? '');
  const [yearsActive, setYearsActive] = useState(profile?.yearsActive?.toString() ?? '1');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave({ businessName, businessType, city, monthlyEstimatedIncome, yearsActive: Number(yearsActive) });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mi negocio</CardTitle>
            <CardDescription>Datos que arman tu score</CardDescription>
          </div>
          {profile && !editing ? (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="mr-1 h-4 w-4" />
              Editar
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Nombre del negocio</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                minLength={2}
                maxLength={120}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessType">Tipo de actividad</Label>
              <Select
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                disabled={loading}
              >
                {(Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]).map((t) => (
                  <option key={t} value={t}>{BUSINESS_TYPE_LABELS[t]}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yearsActive">Años activo</Label>
                <Input
                  id="yearsActive"
                  type="number"
                  min={0}
                  max={80}
                  value={yearsActive}
                  onChange={(e) => setYearsActive(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monthlyIncome">Ingreso mensual estimado (USD)</Label>
              <Input
                id="monthlyIncome"
                type="text"
                inputMode="decimal"
                value={monthlyEstimatedIncome}
                onChange={(e) => setMonthlyEstimatedIncome(e.target.value)}
                placeholder="450.00"
                required
                disabled={loading}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" loading={loading} size="sm">
                <Save className="mr-1 h-4 w-4" />
                Guardar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        ) : profile ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-200">
              <Briefcase className="h-4 w-4 text-slate-500" />
              <span className="font-medium">{profile.businessName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-xs text-slate-500">Tipo</span>
              <span>{BUSINESS_TYPE_LABELS[profile.businessType] ?? profile.businessType}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4 text-slate-500" />
              {profile.city}
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-xs text-slate-500">Ingreso mensual</span>
              <span className="font-mono">{formatUsdc(profile.monthlyEstimatedIncome)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-xs text-slate-500">Antigüedad</span>
              <span>{profile.yearsActive} años</span>
            </div>
          </div>
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
  );
}
