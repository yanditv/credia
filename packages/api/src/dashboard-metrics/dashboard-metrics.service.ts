import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardMetricsResponse, DailyBucket } from './dto/dashboard-metrics-response.dto';

@Injectable()
export class DashboardMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(): Promise<DashboardMetricsResponse> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      loanAgg,
      paymentAgg,
      scoreAgg,
      userCount,
      pendingCount,
      statusCounts,
      recentLoans,
      recentPayments,
      loansLast30,
    ] = await Promise.all([
      this.prisma.loan.aggregate({
        _sum: { principalAmount: true },
        _count: true,
        where: { status: { notIn: ['CANCELLED'] } },
      }),
      this.prisma.loanPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      this.getAverageScore(),
      this.prisma.user.count(),
      this.prisma.loanRequest.count({ where: { status: 'PENDING' } }),
      this.getLoanStatusCounts(),
      this.prisma.loan.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, principalAmount: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.loanPayment.findMany({
        where: { status: 'COMPLETED', paidAt: { gte: sevenDaysAgo } },
        select: { paidAt: true, createdAt: true, amount: true },
        orderBy: { paidAt: 'asc' },
      }),
      this.prisma.loan.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, principalAmount: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const totalLent = Number(loanAgg._sum?.principalAmount ?? 0);
    const totalLoans = loanAgg._count;
    const totalRecovered = Number(paymentAgg._sum?.amount ?? 0);
    const defaultRate = totalLoans > 0 ? Number(((statusCounts.defaulted / totalLoans) * 100).toFixed(1)) : 0;

    return {
      totalLent,
      totalRecovered,
      defaultRate,
      avgScore: scoreAgg,
      activeLoans: statusCounts.active,
      pendingRequests: pendingCount,
      paidLoans: statusCounts.paid,
      defaultedLoans: statusCounts.defaulted,
      totalUsers: userCount,
      lentSparkline: this.bucketize(
        recentLoans.map((l) => ({ date: l.createdAt, amount: Number(l.principalAmount) })),
        7,
      ),
      recoveredSparkline: this.bucketize(
        recentPayments.map((p) => ({ date: p.paidAt ?? p.createdAt, amount: Number(p.amount) })),
        7,
      ),
      loansLast30Days: this.bucketize(
        loansLast30.map((l) => ({ date: l.createdAt, amount: Number(l.principalAmount) })),
        30,
      ),
    };
  }

  private async getLoanStatusCounts() {
    const counts = await this.prisma.loan.groupBy({
      by: ['status'],
      _count: true,
    });
    const result: Record<string, number> = { active: 0, paid: 0, defaulted: 0 };
    for (const c of counts) {
      if (c.status === 'ACTIVE') result.active = c._count;
      if (c.status === 'PAID') result.paid = c._count;
      if (c.status === 'DEFAULTED') result.defaulted = c._count;
    }
    return result;
  }

  private async getAverageScore(): Promise<number> {
    const usersWithScores = await this.prisma.user.findMany({
      where: { creditScores: { some: {} } },
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

  private emptyBuckets(days: number): DailyBucket[] {
    const out: DailyBucket[] = [];
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(now.getUTCDate() - i);
      out.push({ date: d.toISOString().slice(0, 10), count: 0, amount: 0 });
    }
    return out;
  }

  private bucketize(items: { date: Date; amount: number }[], days: number): DailyBucket[] {
    const buckets = this.emptyBuckets(days);
    const index = new Map(buckets.map((b, i) => [b.date, i]));
    for (const item of items) {
      const day = item.date.toISOString().slice(0, 10);
      const i = index.get(day);
      if (i !== undefined) {
        buckets[i].count += 1;
        buckets[i].amount += item.amount;
      }
    }
    return buckets;
  }
}
