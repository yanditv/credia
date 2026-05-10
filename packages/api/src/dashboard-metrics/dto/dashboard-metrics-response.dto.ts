import { ApiProperty } from '@nestjs/swagger';

export class DailyBucket {
  @ApiProperty({ example: '2026-05-09', description: 'Fecha en ISO YYYY-MM-DD' })
  date!: string;

  @ApiProperty({ example: 3, description: 'Cantidad de registros' })
  count!: number;

  @ApiProperty({ example: 450.0, description: 'Suma de montos en USDC' })
  amount!: number;
}

export class DashboardMetricsResponse {
  @ApiProperty({ example: 12500.0, description: 'Total prestado en USDC' })
  totalLent!: number;

  @ApiProperty({ example: 8200.0, description: 'Total recuperado en USDC' })
  totalRecovered!: number;

  @ApiProperty({ example: 8.5, description: 'Porcentaje de mora (0-100)' })
  defaultRate!: number;

  @ApiProperty({ example: 615, description: 'Score promedio de todos los usuarios' })
  avgScore!: number;

  @ApiProperty({ example: 42, description: 'Créditos activos actualmente' })
  activeLoans!: number;

  @ApiProperty({ example: 15, description: 'Solicitudes pendientes de revisión' })
  pendingRequests!: number;

  @ApiProperty({ example: 10, description: 'Créditos pagados' })
  paidLoans!: number;

  @ApiProperty({ example: 3, description: 'Créditos en mora' })
  defaultedLoans!: number;

  @ApiProperty({ example: 25, description: 'Total de usuarios registrados' })
  totalUsers!: number;

  @ApiProperty({ type: [DailyBucket], description: 'Préstamos últimos 7 días (sparkline)' })
  lentSparkline!: DailyBucket[];

  @ApiProperty({ type: [DailyBucket], description: 'Recuperaciones últimos 7 días (sparkline)' })
  recoveredSparkline!: DailyBucket[];

  @ApiProperty({ type: [DailyBucket], description: 'Préstamos últimos 30 días' })
  loansLast30Days!: DailyBucket[];
}
