import { ApiProperty } from '@nestjs/swagger';

class MonthlyLoans {
  @ApiProperty({ example: '2026-01', description: 'Mes en formato YYYY-MM' })
  month!: string;

  @ApiProperty({ example: 12, description: 'Cantidad de créditos desembolsados' })
  count!: number;
}

export class DashboardMetricsResponse {
  @ApiProperty({ example: 12500.0, description: 'Total prestado en USDC' })
  totalLoaned!: number;

  @ApiProperty({ example: 8200.0, description: 'Total recuperado en USDC' })
  totalRecovered!: number;

  @ApiProperty({ example: 8.5, description: 'Porcentaje de mora' })
  defaultRate!: number;

  @ApiProperty({ example: 615, description: 'Score promedio de todos los usuarios' })
  averageScore!: number;

  @ApiProperty({ example: 25, description: 'Total de usuarios registrados' })
  totalUsers!: number;

  @ApiProperty({ example: 42, description: 'Créditos activos actualmente' })
  activeLoans!: number;

  @ApiProperty({ example: 15, description: 'Solicitudes pendientes de revisión' })
  pendingRequests!: number;

  @ApiProperty({
    type: [MonthlyLoans],
    description: 'Créditos desembolsados por mes (últimos 12)',
  })
  monthlyLoans!: MonthlyLoans[];
}