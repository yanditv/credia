import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PaymentsController } from './payments.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { MyPaymentsController } from './my-payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [AuthModule, BlockchainModule],
  controllers: [PaymentsController, AdminPaymentsController, MyPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
