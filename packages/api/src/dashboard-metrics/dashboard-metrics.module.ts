import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DashboardMetricsController } from './dashboard-metrics.controller';
import { DashboardMetricsService } from './dashboard-metrics.service';

@Module({
  imports: [AuthModule],
  controllers: [DashboardMetricsController],
  providers: [DashboardMetricsService],
})
export class DashboardMetricsModule {}
