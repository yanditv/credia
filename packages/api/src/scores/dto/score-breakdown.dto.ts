import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel } from '@prisma/client';

export class ScoreBreakdownDto {
  constantSales!: number;
  paymentHistory!: number;
  commercialReputation!: number;
  businessAge!: number;
  verifiedDocs!: number;
  usageBehavior!: number;
}

export interface ScoreResult {
  score: number;
  riskLevel: RiskLevel;
  maxCreditAmount: number;
  breakdown: ScoreBreakdownDto;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score < 400) return 'HIGH';
  if (score < 600) return 'MEDIUM';
  if (score < 750) return 'ACCEPTABLE';
  return 'LOW';
}

export function getMaxAmountByScore(score: number): number {
  if (score < 400) return 0;
  if (score < 600) return 50;
  if (score < 750) return 150;
  return 300;
}