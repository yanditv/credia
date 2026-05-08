import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'RISK_ANALYST';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = ctx.switchToHttp().getRequest() as { user: CurrentUserPayload };
    return request.user;
  },
);