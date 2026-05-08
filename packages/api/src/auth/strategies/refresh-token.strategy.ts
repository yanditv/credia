import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface RefreshPayload {
  sub: string;
  type: 'refresh';
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') ?? 'fallback-refresh-secret-change-me',
    });
  }

  async validate(payload: RefreshPayload) {
    if (payload.type !== 'refresh') {
      return null;
    }
    return { id: payload.sub };
  }
}