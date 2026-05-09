import { ComingSoon } from '@/components/admin/coming-soon';

export default function UsersPage() {
  return (
    <ComingSoon
      title="Usuarios"
      subtitle="Listado y perfil de usuarios del sistema"
      blockReference="Bloque 5a Día 2 — owner: Sebastián (issue #13)"
      bullets={[
        'Tabla de usuarios con filtros por rol y status',
        'Página perfil /admin/users/:id con datos de negocio',
        'ScoreGauge con score actual + breakdown de 6 componentes',
        'Historial de solicitudes y créditos del usuario',
        'Badge SolanaVerified si el wallet tiene reputación on-chain',
      ]}
    />
  );
}
