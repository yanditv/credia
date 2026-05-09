'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt, Calendar, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { FileUpload } from '@/components/ui/file-upload';
import { incomeRecordsApi } from '@/lib/api/income-records';
import { ApiError } from '@/lib/api';
import { formatUsdc, formatDate } from '@/lib/format';
import type { SourceType } from '@/lib/api-types';

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  DAILY_SALES: 'Ventas diarias',
  INVOICE: 'Factura',
  QR_PAYMENT: 'Pago QR',
  DELIVERY: 'Entrega',
  REFERENCE: 'Referencia',
  OTHER: 'Otro',
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function MisVentasPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const recordsQuery = useQuery({
    queryKey: ['income-records', 'me'],
    queryFn: () => incomeRecordsApi.listMine(),
  });

  const summaryQuery = useQuery({
    queryKey: ['income-records', 'me', 'summary'],
    queryFn: () => incomeRecordsApi.getSummary(),
  });

  const [sourceType, setSourceType] = useState<SourceType>('DAILY_SALES');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recordDate, setRecordDate] = useState(todayIso());
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: incomeRecordsApi.create,
    onSuccess: () => {
      toast.success('Venta registrada');
      qc.invalidateQueries({ queryKey: ['income-records'] });
      setAmount('');
      setDescription('');
      setRecordDate(todayIso());
      setEvidenceUrl(null);
      setShowForm(false);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Error al registrar la venta';
      toast.error(msg);
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate({
      sourceType,
      amount,
      description: description.trim() || undefined,
      evidenceUrl: evidenceUrl ?? undefined,
      recordDate: new Date(recordDate).toISOString(),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Mis ventas</h1>
          <p className="mt-1 text-sm text-slate-400">
            Registrá tus ingresos para construir tu score financiero
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" />
          {showForm ? 'Cerrar' : 'Nueva venta'}
        </Button>
      </div>

      {summaryQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <SkeletonCard height={90} />
          <SkeletonCard height={90} />
          <SkeletonCard height={90} />
        </div>
      ) : summaryQuery.data ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Total registros" value={summaryQuery.data.totalRecords.toString()} />
          <SummaryCard
            label="Total ingresado"
            value={formatUsdc(summaryQuery.data.totalAmount)}
          />
          <SummaryCard
            label="Últimos 7 días"
            value={formatUsdc(summaryQuery.data.last7Days.total)}
            sub={`${summaryQuery.data.last7Days.count} ventas`}
          />
        </div>
      ) : null}

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Nueva venta o ingreso</CardTitle>
            <CardDescription>
              Cuanto más constante sea tu registro, mejor es tu score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sourceType">Tipo</Label>
                <Select
                  id="sourceType"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as SourceType)}
                  disabled={mutation.isPending}
                >
                  {(Object.keys(SOURCE_TYPE_LABELS) as SourceType[]).map((t) => (
                    <option key={t} value={t}>
                      {SOURCE_TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Monto (USD)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="25.00"
                  required
                  pattern="[0-9]+([.][0-9]{1,2})?"
                  disabled={mutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordDate">Fecha</Label>
                <Input
                  id="recordDate"
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  required
                  max={todayIso()}
                  disabled={mutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Venta de frutas en el mercado"
                  maxLength={280}
                  disabled={mutation.isPending}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Comprobante (opcional)</Label>
                <p className="text-xs text-slate-500">
                  Subir un comprobante mejora tu score (componente _documentación verificada_, 10%)
                </p>
                <FileUpload
                  value={evidenceUrl}
                  onUploaded={setEvidenceUrl}
                  onClear={() => setEvidenceUrl(null)}
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" loading={mutation.isPending} className="w-full" size="lg">
                  Registrar venta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {recordsQuery.isLoading ? (
        <SkeletonCard height={200} />
      ) : recordsQuery.error ? (
        <ErrorState
          title="Error al cargar tus ventas"
          error={recordsQuery.error}
          onRetry={() => recordsQuery.refetch()}
        />
      ) : !recordsQuery.data || recordsQuery.data.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aún no registraste ventas"
          description="Registrá tu primera venta para empezar a construir tu score"
          action={
            !showForm ? (
              <Button size="sm" onClick={() => setShowForm(true)}>
                Registrar mi primera venta
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
            <CardDescription>{recordsQuery.data.length} registros en total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-800">
              {recordsQuery.data.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-1 items-start gap-3 min-w-0">
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                      <Receipt className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="slate">{SOURCE_TYPE_LABELS[r.sourceType]}</Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(r.recordDate)}
                        </span>
                      </div>
                      {r.description ? (
                        <p className="mt-1 text-sm text-slate-300 line-clamp-2">{r.description}</p>
                      ) : null}
                      {r.evidenceUrl ? (
                        <a
                          href={r.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
                        >
                          <FileText className="h-3 w-3" /> Ver comprobante
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <span className="font-mono text-base font-semibold tabular-nums text-slate-100">
                    {formatUsdc(r.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-100">{value}</p>
        {sub ? <p className="mt-0.5 text-xs text-slate-400">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}
