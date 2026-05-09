import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanRequestDto } from './dto/create-loan-request.dto';
import { RejectLoanRequestDto } from './dto/reject-loan-request.dto';
import { getMaxAmountByScore, MIN_SCORE_FOR_LOAN } from './helpers/score-cupos';
import { calculateLoanAmounts } from '../loans/helpers/interest-calc';
import { BlockchainService } from '../blockchain/blockchain.service';
import { LoanRequestStatus, LoanStatus, Prisma } from '@prisma/client';
import { createHash } from 'crypto';

// Errores de Prisma se mapean centralmente vía PrismaClientExceptionFilter.

@Injectable()
export class LoanRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async create(userId: string, dto: CreateLoanRequestDto) {
    const score = await this.prisma.creditScore.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!score) {
      throw new HttpException(
        'Necesitas calcular tu score antes de solicitar un crédito',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (score.score < MIN_SCORE_FOR_LOAN) {
      throw new HttpException(
        `Score insuficiente (${score.score}/${MIN_SCORE_FOR_LOAN} mínimo) — todavía no calificas para un crédito`,
        HttpStatus.FORBIDDEN,
      );
    }

    const maxAmount = getMaxAmountByScore(score.score);
    const requested = Number(dto.requestedAmount);

    if (Number.isNaN(requested) || requested <= 0) {
      throw new HttpException('El monto solicitado debe ser mayor a 0', HttpStatus.BAD_REQUEST);
    }

    if (requested > maxAmount) {
      throw new HttpException(
        `Tu cupo actual es $${maxAmount} USDC (score ${score.score}); solicitaste $${requested}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.loanRequest.create({
      data: {
        userId,
        requestedAmount: dto.requestedAmount,
        termDays: dto.termDays,
        purpose: dto.purpose,
        scoreId: score.id,
        status: LoanRequestStatus.PENDING,
      },
    });
  }

  async listMine(userId: string) {
    return this.prisma.loanRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAll(filters: { status?: LoanRequestStatus }) {
    return this.prisma.loanRequest.findMany({
      where: filters.status ? { status: filters.status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async approve(id: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const request = await tx.loanRequest.findUnique({ where: { id } });
      if (!request) {
        throw new HttpException('Solicitud no encontrada', HttpStatus.NOT_FOUND);
      }
      if (request.status !== LoanRequestStatus.PENDING) {
        throw new HttpException(
          `La solicitud ya fue procesada (estado: ${request.status})`,
          HttpStatus.CONFLICT,
        );
      }

      const user = await tx.user.findUnique({
        where: { id: request.userId },
        select: { walletAddress: true },
      });

      const principal = Number(request.requestedAmount);
      const amounts = calculateLoanAmounts(principal, request.termDays);

      const loan = await tx.loan.create({
        data: {
          userId: request.userId,
          loanRequestId: request.id,
          principalAmount: amounts.principal.toFixed(2),
          interestAmount: amounts.interest.toFixed(2),
          totalAmount: amounts.total.toFixed(2),
          status: LoanStatus.ACTIVE,
        },
      });

      if (user?.walletAddress) {
        const loanIdHash = createHash('sha256').update(loan.id).digest('hex');
        const amountHash = createHash('sha256').update(amounts.principal.toFixed(2)).digest('hex');

        try {
          const result = await this.blockchainService.registerLoan({
            targetWallet: user.walletAddress,
            loanIdHashHex: loanIdHash,
            amountHashHex: amountHash,
          });

          await tx.loan.update({
            where: { id: loan.id },
            data: {
              blockchainTx: String(result.signature),
              blockchainLoanRecord: result.loanRecord.toString(),
            },
          });
        } catch {
          // Soft fail: el crédito se aprueba igual, blockchainTx queda null
        }
      }

      await tx.loanRequest.update({
        where: { id },
        data: { status: LoanRequestStatus.APPROVED },
      });

      return { loanRequest: { ...request, status: LoanRequestStatus.APPROVED }, loan };
    });
  }

  async reject(id: string, _dto: RejectLoanRequestDto) {
    const request = await this.prisma.loanRequest.findUnique({ where: { id } });
    if (!request) {
      throw new HttpException('Solicitud no encontrada', HttpStatus.NOT_FOUND);
    }
    if (request.status !== LoanRequestStatus.PENDING) {
      throw new HttpException(
        `La solicitud ya fue procesada (estado: ${request.status})`,
        HttpStatus.CONFLICT,
      );
    }
    return this.prisma.loanRequest.update({
      where: { id },
      data: { status: LoanRequestStatus.REJECTED },
    });
  }
}
