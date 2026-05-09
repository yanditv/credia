import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BusinessProfilesModule } from './business-profiles/business-profiles.module';
import { LoanRequestsModule } from './loan-requests/loan-requests.module';
import { LoansModule } from './loans/loans.module';
import { PaymentsModule } from './payments/payments.module';
import { IncomeRecordsModule } from './income-records/income-records.module';
import { ScoresModule } from './scores/scores.module';
import { DashboardMetricsModule } from './dashboard-metrics/dashboard-metrics.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BusinessProfilesModule,
    LoanRequestsModule,
    LoansModule,
    PaymentsModule,
    IncomeRecordsModule,
    ScoresModule,
    DashboardMetricsModule,
    BlockchainModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}
