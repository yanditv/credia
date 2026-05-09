import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { LoanStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

// CASH/TRANSFER quedan COMPLETED inmediato (admin confía en el reporte).
// USDC_ON_CHAIN queda PENDING hasta que el módulo blockchain (Día 3) confirme
// la tx en Solana y mueva a COMPLETED.

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(loanId: string, requestingUserId: string, isAdmin: boolean, dto: CreatePaymentDto) {
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      throw new HttpException('Crédito no encontrado', HttpStatus.NOT_FOUND);
    }
    if (!isAdmin && loan.userId !== requestingUserId) {
      throw new HttpException('No tienes acceso a este crédito', HttpStatus.FORBIDDEN);
    }
    if (loan.status !== LoanStatus.ACTIVE) {
      throw new HttpException(
        `No se pueden registrar pagos: el crédito está en estado ${loan.status}`,
        HttpStatus.CONFLICT,
      );
    }

    const amount = Number(dto.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      throw new HttpException('El monto debe ser mayor a 0', HttpStatus.BAD_REQUEST);
    }

    const isOnChain = dto.paymentMethod === PaymentMethod.USDC_ON_CHAIN;
    const status = isOnChain ? PaymentStatus.PENDING : PaymentStatus.COMPLETED;
    const paidAt = isOnChain ? null : new Date();

    return this.prisma.loanPayment.create({
      data: {
        loanId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status,
        blockchainTx: dto.blockchainTx ?? null,
        paidAt,
      },
    });
  }

  async listForLoan(loanId: string, requestingUserId: string, isAdmin: boolean) {
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      throw new HttpException('Crédito no encontrado', HttpStatus.NOT_FOUND);
    }
    if (!isAdmin && loan.userId !== requestingUserId) {
      throw new HttpException('No tienes acceso a este crédito', HttpStatus.FORBIDDEN);
    }
    return this.prisma.loanPayment.findMany({
      where: { loanId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
