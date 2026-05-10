'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Filter, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { auditApi } from '@/lib/api/audit';
import { useAuthStore } from '@/lib/auth-store';
import { formatDate } from '@/lib/format';
import type { AuditLogEntry } from '@/lib/api-types';

export default function AuditPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'RISK_ANALYST';

  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{ action?: string; userId?: string }>({});

  const query = useQuery({
    queryKey: ['admin-audit', page, appliedFilters],
    queryFn: () =>
      auditApi.list({
        page,
        limit: 50,
        action: appliedFilters.action || undefined,
        userId: appliedFilters.userId || undefined,
      }),
    enabled: isAdmin,
    placeholderData: keepPreviousData,
  });

  function applyFilters() {
    setPage(1);
    setAppliedFilters({
      action: actionFilter.trim() || undefined,
      userId: userIdFilter.trim() || undefined,
    });
  }

  function clearFilters() {
    setActionFilter('');
    setUserIdFilter('');
    setPage(1);
    setAppliedFilters({});
  }

  if (!isAdmin) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
        Esta vista es solo para roles ADMIN / RISK_ANALYST.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Auditoría</h1>
        <p className="mt-1 text-sm text-slate-400">
          Log de mutaciones del sistema capturado automáticamente por el AuditInterceptor
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Acción (ej. <span className="font-mono">LoanRequests.approve</span>)
            </label>
            <Input
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="Filtrar por acción exacta"
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-400">User ID</label>
            <Input
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="cmox..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={applyFilters}>
              <Search className="h-4 w-4" />
              Filtrar
            </Button>
            {(appliedFilters.action || appliedFilters.userId) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {query.isLoading && !query.data ? (
        <div className="flex h-32 items-center justify-center text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-2">Cargando logs…</span>
        </div>
      ) : query.error ? (
        <ErrorState
          title="Error al cargar logs"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      ) : !query.data || query.data.data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-sm text-slate-400">
          {appliedFilters.action || appliedFilters.userId
            ? 'No hay logs que coincidan con los filtros'
            : 'No hay logs aún — hacé alguna mutación admin para que aparezcan'}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {query.data.total} {query.data.total === 1 ? 'evento' : 'eventos'}
              {appliedFilters.action || appliedFilters.userId ? (
                <span className="ml-2 inline-flex items-center gap-1 rounded bg-slate-800/60 px-2 py-0.5">
                  <Filter className="h-3 w-3" /> filtrado
                </span>
              ) : null}
            </span>
            <span>
              Página {query.data.page} / {query.data.totalPages}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="w-8 px-4 py-3"></th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Acción</th>
                  <th className="px-4 py-3">Recurso</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {query.data.data.map((entry) => (
                  <AuditRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>

          {query.data.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || query.isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= query.data.totalPages || query.isFetching}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AuditRow({ entry }: { entry: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = entry.metadata !== null || entry.url !== null || entry.resourceId !== null;

  return (
    <>
      <tr className="hover:bg-slate-900/40">
        <td className="px-4 py-3 align-top">
          {hasDetails ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Ocultar detalles' : 'Ver detalles'}
              className="text-slate-500 transition-colors hover:text-slate-200"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : null}
        </td>
        <td className="px-4 py-3 align-top text-xs text-slate-400">{formatDate(entry.createdAt)}</td>
        <td className="px-4 py-3 align-top">
          <Badge tone="blue">
            <span className="font-mono text-xs">{entry.action}</span>
          </Badge>
        </td>
        <td className="px-4 py-3 align-top text-xs text-slate-300">{entry.resource}</td>
        <td className="px-4 py-3 align-top">
          {entry.userId ? (
            <span className="font-mono text-xs text-slate-400">
              {entry.userId.slice(0, 8)}…
            </span>
          ) : (
            <span className="text-xs italic text-slate-600">—</span>
          )}
        </td>
        <td className="px-4 py-3 align-top text-xs text-slate-500">{entry.ip ?? '—'}</td>
      </tr>
      {expanded && (
        <tr className="bg-slate-950/40">
          <td colSpan={6} className="px-4 py-3">
            <div className="space-y-2 rounded-md border border-slate-800 bg-slate-900/60 p-3">
              {entry.url ? (
                <DetailRow label="URL">
                  <span className="font-mono text-xs text-slate-200">{entry.url}</span>
                </DetailRow>
              ) : null}
              {entry.resourceId ? (
                <DetailRow label="Resource ID">
                  <span className="font-mono text-xs text-slate-200">{entry.resourceId}</span>
                </DetailRow>
              ) : null}
              {entry.metadata ? (
                <DetailRow label="Metadata">
                  <pre className="overflow-x-auto rounded bg-slate-950/60 p-2 font-mono text-xs leading-relaxed text-slate-200">
                    {JSON.stringify(entry.metadata, null, 2)}
                  </pre>
                </DetailRow>
              ) : null}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[120px_1fr] sm:gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <div>{children}</div>
    </div>
  );
}
