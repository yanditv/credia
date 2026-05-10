import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { LoanRequestsController } from './loan-requests.controller';
import { AdminLoanRequestsController } from './admin-loan-requests.controller';
import { LoanRequestsService } from './loan-requests.service';

@Module({
  imports: [AuthModule, BlockchainModule],
  controllers: [LoanRequestsController, AdminLoanRequestsController],
  providers: [LoanRequestsService],
  exports: [LoanRequestsService],
})
export class LoanRequestsModule {}
