import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ScoresController } from './scores.controller';
import { AdminScoresController } from './admin-scores.controller';
import { ScoresService } from './scores.service';

@Module({
  imports: [AuthModule],
  controllers: [ScoresController, AdminScoresController],
  providers: [ScoresService],
  exports: [ScoresService],
})
export class ScoresModule {}