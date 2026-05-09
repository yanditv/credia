import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      user?: { id: string };
      ip?: string;
      params?: Record<string, string>;
    }>();

    const method = request.method;
    const url = request.url;
    const userId = request.user?.id;
    const ip = request.ip;

    const methodsToSkip = ['GET'];
    if (methodsToSkip.includes(method)) return next.handle();

    const resource = url.split('/')[2] ?? 'unknown';
    const action = `${method}_${url.replace(/\//g, '_').toUpperCase()}`;

    return next.handle().pipe(
      tap(() => {
        this.prisma.auditLog
          .create({
            data: {
              userId,
              action,
              resource,
              resourceId: request.params?.id,
              ip,
              metadata: { method, url },
            },
          })
          .catch(() => {
            // Silently ignore audit log failures
          });
      }),
    );
  }
}