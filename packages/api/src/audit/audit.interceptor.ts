import { Reflector } from '@nestjs/core';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

export const AUDIT_ACTION_KEY = 'audit:action';
export const AuditAction = (action: string) => SetMetadata(AUDIT_ACTION_KEY, action);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      user?: { id: string };
      ip?: string;
    }>();

    const method = request.method;
    const url = request.url;
    const userId = request.user?.id;
    const ip = request.ip;

    const methodsToSkip = ['GET'];
    if (methodsToSkip.includes(method)) return next.handle();

    const customAction = this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler());
    const className = context.getClass().name.replace('Controller', '');
    const handlerName = context.getHandler().name;

    const action = customAction ?? `${className}.${handlerName}`;
    const resource = className.toLowerCase();

    return next.handle().pipe(
      tap(() => {
        this.prisma.auditLog
          .create({
            data: {
              userId,
              action,
              resource,
              url,
              ip,
              metadata: { method, url },
            },
          })
          .catch((err: Error) => {
            console.error('[AuditInterceptor] falló al guardar log:', err.message);
          });
      }),
    );
  }
}