import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'RISK_ANALYST';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
     
    const request = ctx.switchToHttp().getRequest();
     
    return request.user;
  },
);