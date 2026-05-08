import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vista general de cartera, créditos activos y solicitudes pendientes
        </p>
      </div>

      {/* Placeholder KPI cards — Bloque 4 Día 2 las completa con datos reales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCardPlaceholder label="Total prestado" value="$0" hint="USDC desembolsado" />
        <KpiCardPlaceholder label="Total recuperado" value="$0" hint="Pagos completados" />
        <KpiCardPlaceholder label="Mora" value="0%" hint="Préstamos vencidos" />
        <KpiCardPlaceholder label="Score promedio" value="—" hint="Sobre 1000" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>
            Esta sección la completa el bloque 4 del Día 2: gráfico de créditos
            últimos 30 días, tabla de solicitudes pendientes y panel de mora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>📊 LineChart Recharts — créditos desembolsados últimos 30 días</li>
            <li>📋 Tabla de solicitudes pendientes con aprobar/rechazar inline</li>
            <li>⚠️ Mini-panel de mora con cuentas en riesgo</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCardPlaceholder({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-2 font-mono text-3xl font-semibold text-slate-100">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      </CardContent>
    </Card>
  );
}
