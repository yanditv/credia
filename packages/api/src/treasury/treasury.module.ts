import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { TreasuryController } from './treasury.controller';

@Module({
  imports: [AuthModule, BlockchainModule],
  controllers: [TreasuryController],
})
export class TreasuryModule {}
