import { ApiProperty } from '@nestjs/swagger';

export class AuditLogEntry {
  @ApiProperty({ example: 'clx...' }) id!: string;
  @ApiProperty({ example: 'clx...', description: 'ID del usuario que realizó la acción (nullable)' }) userId!: string | null;
  @ApiProperty({ example: 'LOAN_APPROVED' }) action!: string;
  @ApiProperty({ example: 'loan-requests' }) resource!: string;
  @ApiProperty({ example: 'clx...', nullable: true }) resourceId!: string | null;
  @ApiProperty({ example: { status: 'APPROVED' }, description: 'Metadata adicional' }) metadata!: Record<string, unknown> | null;
  @ApiProperty({ example: '192.168.1.1', nullable: true }) ip!: string | null;
  @ApiProperty({ example: '2026-05-09T00:00:00.000Z' }) createdAt!: string;
}

export class PaginatedAuditResponse {
  @ApiProperty({ type: [AuditLogEntry] }) data!: AuditLogEntry[];
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 50 }) limit!: number;
  @ApiProperty({ example: 150 }) total!: number;
  @ApiProperty({ example: 3 }) totalPages!: number;
}
