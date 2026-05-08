import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

// STUB MODULE — reemplazar por feat/api/auth-module (Cesar) cuando mergee a develop.
// Solo expone el guard mock para que los demás módulos puedan usar @UseGuards(JwtAuthGuard).

@Module({
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
