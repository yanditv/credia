import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedAuditResponse } from './dto/audit-response.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async list(options: { page?: number; limit?: number; action?: string; userId?: string }) {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (options.action) where.action = options.action;
    if (options.userId) where.userId = options.userId;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const entries = data.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      metadata: e.metadata as Record<string, unknown> | null,
    }));

    return {
      data: entries,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    } satisfies PaginatedAuditResponse;
  }

  async log(params: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    url?: string;
    metadata?: Record<string, unknown>;
    ip?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        url: params.url,
        metadata: (params.metadata ?? {}) as object,
        ip: params.ip,
      },
    });
  }
}
