import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// STUB — reemplazar por la implementación real de Cesar (feat/api/auth-module).
// Inyecta un usuario demo en req.user para que los controllers compilen y respondan
// durante el desarrollo paralelo.

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: 'demo-user-1',
      email: 'demo@credia.io',
      role: 'USER' as const,
    };
    return true;
  }
}
