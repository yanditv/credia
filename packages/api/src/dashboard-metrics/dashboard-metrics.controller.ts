import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { DashboardMetricsService } from './dashboard-metrics.service';
import { DashboardMetricsResponse } from './dto/dashboard-metrics-response.dto';

@ApiTags('admin/dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RISK_ANALYST')
@Controller('admin/dashboard')
export class DashboardMetricsController {
  constructor(private readonly service: DashboardMetricsService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas del dashboard (agregaciones)' })
  @ApiResponse({ status: 200, type: DashboardMetricsResponse })
  getMetrics(): Promise<DashboardMetricsResponse> {
    return this.service.getMetrics();
  }
}