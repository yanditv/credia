import { ComingSoon } from '@/components/admin/coming-soon';

export default function AuditPage() {
  return (
    <ComingSoon
      title="Auditoría"
      subtitle="Log de eventos críticos: consentimientos, aprobaciones, cambios de estado y transacciones blockchain"
      blockReference="Bloque 7 Día 3 — owner: Cesar / Junior"
      bullets={[
        'Modelo Prisma AuditLog (actor, action, entity, before/after, ip, timestamp)',
        'Interceptor NestJS que loguea automáticamente operaciones admin',
        'Endpoint GET /api/admin/audit paginado con filtros',
        'Tabla de eventos con expand inline para JSON before/after',
        'Asociación con hashes de blockchain cuando aplica (link a Solana Explorer)',
      ]}
    />
  );
}
