import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: { expiresIn: '1h' },
        }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    JwtAuthGuard,
    RefreshTokenGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RefreshTokenGuard, RolesGuard],
})
export class AuthModule {}