import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoanStatus } from '@prisma/client';

// El Loan se crea desde LoanRequestsService.approve() (transactional). Este
// servicio solo expone lectura para usuarios y admins. Errores Prisma se
// mapean centralmente vía PrismaClientExceptionFilter.

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string) {
    return this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        loanRequest: {
          select: { termDays: true, purpose: true },
        },
      },
    });
  }

  async getById(id: string, requestingUserId: string, isAdmin: boolean) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        loanRequest: { select: { termDays: true, purpose: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!loan) {
      throw new HttpException('Crédito no encontrado', HttpStatus.NOT_FOUND);
    }
    if (!isAdmin && loan.userId !== requestingUserId) {
      throw new HttpException('No tienes acceso a este crédito', HttpStatus.FORBIDDEN);
    }
    return loan;
  }

  async listAll(filters: { status?: LoanStatus }) {
    return this.prisma.loan.findMany({
      where: filters.status ? { status: filters.status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        // termDays necesario para que /admin/defaulted calcule daysToExpire
        // correctamente (sin el fallback de 30d). Daniel señaló esto en
        // review de PR #17.
        loanRequest: { select: { termDays: true, purpose: true } },
      },
    });
  }
}
