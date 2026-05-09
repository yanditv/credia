import { Badge } from '@/components/ui/badge';
import type { LoanRequestStatus, LoanStatus } from '@/lib/api-types';

const REQUEST_TONE: Record<LoanRequestStatus, { tone: 'amber' | 'green' | 'red' | 'slate'; label: string }> = {
  PENDING: { tone: 'amber', label: 'Pendiente' },
  APPROVED: { tone: 'green', label: 'Aprobada' },
  REJECTED: { tone: 'red', label: 'Rechazada' },
  CANCELLED: { tone: 'slate', label: 'Cancelada' },
};

const LOAN_TONE: Record<LoanStatus, { tone: 'green' | 'blue' | 'red' | 'slate'; label: string }> = {
  ACTIVE: { tone: 'green', label: 'Activo' },
  PAID: { tone: 'blue', label: 'Pagado' },
  DEFAULTED: { tone: 'red', label: 'Mora' },
  CANCELLED: { tone: 'slate', label: 'Cancelado' },
};

export function LoanRequestStatusBadge({ status }: { status: LoanRequestStatus }) {
  const config = REQUEST_TONE[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const config = LOAN_TONE[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
