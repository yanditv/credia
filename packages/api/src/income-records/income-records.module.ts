import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IncomeRecordsController } from './income-records.controller';
import { IncomeRecordsService } from './income-records.service';

@Module({
  imports: [AuthModule],
  controllers: [IncomeRecordsController],
  providers: [IncomeRecordsService],
  exports: [IncomeRecordsService],
})
export class IncomeRecordsModule {}