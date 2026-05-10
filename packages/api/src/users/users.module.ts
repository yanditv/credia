import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, BlockchainModule],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
