import { ComingSoon } from '@/components/admin/coming-soon';

export default function DefaultedPage() {
  return (
    <ComingSoon
      title="Mora"
      subtitle="Préstamos vencidos sin pago suficiente y cuentas en riesgo"
      blockReference="Bloque 4 Día 2 — owner: Sebastián (issue #13)"
      bullets={[
        'Tabla de loans en estado DEFAULTED con días de atraso',
        'Loans ACTIVE próximos a vencer (alerta amarilla)',
        'Métricas: tasa de mora actual, monto en mora total, recuperación esperada',
        'Acción mark_default (admin) que dispara tx en Anchor mark_default',
        'Notificaciones a usuarios con mora reciente',
      ]}
    />
  );
}
