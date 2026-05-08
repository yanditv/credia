import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// STUB — reemplazar por la versión tipada con Prisma User cuando feat/api/auth-module mergee.

export interface CurrentUserPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'RISK_ANALYST';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    return ctx.switchToHttp().getRequest().user as CurrentUserPayload;
  },
);
