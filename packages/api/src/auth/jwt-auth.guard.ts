import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
     
    const req = context.switchToHttp().getRequest();
     
    req.user = {
      id: 'demo-user-1',
      email: 'demo@credia.io',
      role: 'USER',
    };
    return true;
  }
}