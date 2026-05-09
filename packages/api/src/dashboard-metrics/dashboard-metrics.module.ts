import { Module } from '@nestjs/common';
import { DashboardMetricsController } from './dashboard-metrics.controller';
import { DashboardMetricsService } from './dashboard-metrics.service';

@Module({
  controllers: [DashboardMetricsController],
  providers: [DashboardMetricsService],
})
export class DashboardMetricsModule {}