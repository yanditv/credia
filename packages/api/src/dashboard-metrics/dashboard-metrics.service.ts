import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardMetricsResponse } from './dto/dashboard-metrics-response.dto';

@Injectable()
export class DashboardMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(): Promise<DashboardMetricsResponse> {
    const [loanAgg, paymentAgg, scoreAgg, userCount, pendingCount, monthlyLoans] =
      await Promise.all([
        this.getLoanAggregation(),
        this.getPaymentAggregation(),
        this.getAverageScore(),
        this.prisma.user.count(),
        this.prisma.loanRequest.count({ where: { status: 'PENDING' } }),
        this.getMonthlyLoans(),
      ]);

    const totalLoaned = Number(loanAgg._sum?.principalAmount ?? 0);
    const totalLoans = loanAgg._count;
    const defaultedLoans = await this.prisma.loan.count({ where: { status: 'DEFAULTED' } });
    const activeLoans = await this.prisma.loan.count({ where: { status: 'ACTIVE' } });
    const totalRecovered = Number(paymentAgg._sum?.amount ?? 0);
    const defaultRate = totalLoans > 0 ? Math.round((defaultedLoans / totalLoans) * 100 * 10) / 10 : 0;

    return {
      totalLoaned,
      totalRecovered,
      defaultRate,
      averageScore: scoreAgg,
      totalUsers: userCount,
      activeLoans,
      pendingRequests: pendingCount,
      monthlyLoans,
    };
  }

  private async getLoanAggregation() {
    return this.prisma.loan.aggregate({
      _sum: { principalAmount: true },
      _count: true,
      where: { status: { notIn: ['CANCELLED'] } },
    });
  }

  private async getPaymentAggregation() {
    return this.prisma.loanPayment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });
  }

  private async getAverageScore(): Promise<number> {
    const usersWithScores = await this.prisma.user.findMany({
      where: {
        creditScores: { some: {} },
      },
      select: {
        creditScores: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { score: true },
        },
      },
    });

    if (usersWithScores.length === 0) return 0;

    const sum = usersWithScores.reduce((acc, u) => acc + (u.creditScores[0]?.score ?? 0), 0);
    return Math.round(sum / usersWithScores.length);
  }

  private async getMonthlyLoans() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const loans = await this.prisma.loan.findMany({
      where: {
        createdAt: { gte: twelveMonthsAgo },
        status: { notIn: ['CANCELLED'] },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthMap = new Map<string, number>();
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthMap.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0);
    }

    for (const loan of loans) {
      const key = `${loan.createdAt.getFullYear()}-${String(loan.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }

    return Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}