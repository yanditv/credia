import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoreBreakdownDto, ScoreResult, getRiskLevel, getMaxAmountByScore } from './dto/score-breakdown.dto';
import { RiskLevel, SourceType } from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class ScoresService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(userId: string): Promise<ScoreResult> {
    const [incomeRecords, businessProfile, previousLoans] = await Promise.all([
      this.prisma.incomeRecord.findMany({
        where: { userId },
        select: { sourceType: true, amount: true, recordDate: true, evidenceUrl: true },
      }),
      this.prisma.businessProfile.findUnique({ where: { userId } }),
      this.prisma.loan.findMany({
        where: { userId, status: { in: ['PAID', 'ACTIVE'] } },
        select: { status: true },
      }),
    ]);

    const breakdown = this.calculateBreakdown(incomeRecords, businessProfile, previousLoans);
    const score = this.computeFinalScore(breakdown);
    const riskLevel = getRiskLevel(score);
    const maxCreditAmount = getMaxAmountByScore(score);

    const savedScore = await this.prisma.creditScore.create({
      data: {
        userId,
        score,
        riskLevel,
        maxCreditAmount,
        scoreHash: this.generateScoreHash(userId, score, breakdown),
        breakdown: breakdown as unknown as object,
      },
    });

    return {
      score,
      riskLevel,
      maxCreditAmount,
      breakdown,
    };
  }

  async listMine(userId: string) {
    return this.prisma.creditScore.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatest(userId: string) {
    return this.prisma.creditScore.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private calculateBreakdown(
    incomeRecords: { sourceType: SourceType; amount: unknown; recordDate: Date; evidenceUrl: string | null }[],
    businessProfile: { yearsActive: number; monthlyEstimatedIncome: unknown } | null,
    previousLoans: { status: string }[],
  ): ScoreBreakdownDto {
    const constantSales = this.calculateConstantSales(incomeRecords);
    const paymentHistory = this.calculatePaymentHistory(previousLoans);
    const commercialReputation = this.calculateCommercialReputation(incomeRecords.length);
    const businessAge = this.calculateBusinessAge(businessProfile?.yearsActive ?? 0);
    const verifiedDocs = this.calculateVerifiedDocs(incomeRecords);
    const usageBehavior = this.calculateUsageBehavior(incomeRecords.length);

    return {
      constantSales,
      paymentHistory,
      commercialReputation,
      businessAge,
      verifiedDocs,
      usageBehavior,
    };
  }

  private calculateConstantSales(records: { recordDate: Date }[]): number {
    if (records.length === 0) return 0;

    const now = new Date();
    const last30Days = records.filter((r) => {
      const diff = now.getTime() - r.recordDate.getTime();
      return diff <= 30 * 24 * 60 * 60 * 1000;
    });

    if (last30Days.length === 0) return 10;
    if (last30Days.length < 7) return 30;
    if (last30Days.length < 15) return 50;
    if (last30Days.length < 25) return 70;
    return Math.min(100, 70 + (last30Days.length - 25) * 3);
  }

  private calculatePaymentHistory(loans: { status: string }[]): number {
    if (loans.length === 0) return 50;
    const paidLoans = loans.filter((l) => l.status === 'PAID').length;
    const ratio = paidLoans / loans.length;
    return Math.round(50 + ratio * 50);
  }

  private calculateCommercialReputation(recordCount: number): number {
    if (recordCount === 0) return 30;
    if (recordCount < 5) return 40;
    if (recordCount < 15) return 55;
    if (recordCount < 30) return 70;
    return Math.min(100, 70 + (recordCount - 30) * 0.5);
  }

  private calculateBusinessAge(years: number): number {
    if (years === 0) return 20;
    if (years < 1) return 40;
    if (years < 2) return 55;
    if (years < 3) return 70;
    if (years < 5) return 85;
    return 100;
  }

  private calculateVerifiedDocs(records: { evidenceUrl: string | null }[]): number {
    const withEvidence = records.filter((r) => r.evidenceUrl).length;
    if (records.length === 0) return 30;
    const ratio = withEvidence / records.length;
    return Math.round(30 + ratio * 70);
  }

  private calculateUsageBehavior(recordCount: number): number {
    if (recordCount === 0) return 30;
    if (recordCount < 5) return 45;
    if (recordCount < 15) return 60;
    if (recordCount < 30) return 75;
    return Math.min(100, 75 + (recordCount - 30) * 0.5);
  }

  private computeFinalScore(breakdown: ScoreBreakdownDto): number {
    const weights = {
      constantSales: 0.25,
      paymentHistory: 0.30,
      commercialReputation: 0.15,
      businessAge: 0.10,
      verifiedDocs: 0.10,
      usageBehavior: 0.10,
    };

    const raw =
      breakdown.constantSales * weights.constantSales +
      breakdown.paymentHistory * weights.paymentHistory +
      breakdown.commercialReputation * weights.commercialReputation +
      breakdown.businessAge * weights.businessAge +
      breakdown.verifiedDocs * weights.verifiedDocs +
      breakdown.usageBehavior * weights.usageBehavior;

    return Math.round(raw * 10);
  }

  private generateScoreHash(userId: string, score: number, breakdown: ScoreBreakdownDto): string {
    const data = `${userId}:${score}:${JSON.stringify(breakdown)}:${Date.now()}`;
    return createHash('sha256').update(data).digest('hex');
  }
}