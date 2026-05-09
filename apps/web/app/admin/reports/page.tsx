import { ComingSoon } from '@/components/admin/coming-soon';

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Reportes"
      subtitle="Vistas analíticas para el equipo administrativo"
      blockReference="Bloque 6 Día 3 — owner: Sebastián / Cesar"
      bullets={[
        'Endpoint GET /api/admin/dashboard/metrics con agregaciones',
        'Cartera por estado (donut chart)',
        'Volumen prestado vs recuperado mensual (barras agrupadas)',
        'Distribución de scores en cohortes (histograma)',
        'Top 10 prestamistas por monto recuperado',
        'Export CSV con filtros aplicados',
      ]}
    />
  );
}
