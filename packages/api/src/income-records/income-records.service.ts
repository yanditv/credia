import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeRecordDto } from './dto/create-income-record.dto';
import { UpdateIncomeRecordDto } from './dto/update-income-record.dto';
import { Prisma, SourceType } from '@prisma/client';

export interface IncomeSummary {
  totalRecords: number;
  totalAmount: number;
  averageAmount: number;
  bySourceType: { sourceType: SourceType; count: number; total: number }[];
  last30Days: { count: number; total: number };
  last7Days: { count: number; total: number };
}

@Injectable()
export class IncomeRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateIncomeRecordDto) {
    return this.prisma.incomeRecord.create({
      data: {
        userId,
        sourceType: dto.sourceType,
        amount: dto.amount,
        description: dto.description,
        evidenceUrl: dto.evidenceUrl,
        recordDate: new Date(dto.recordDate),
      },
    });
  }

  async listMine(userId: string) {
    return this.prisma.incomeRecord.findMany({
      where: { userId },
      orderBy: { recordDate: 'desc' },
      take: 100,
    });
  }

  async getById(id: string, userId: string) {
    const record = await this.prisma.incomeRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new HttpException('Registro no encontrado', HttpStatus.NOT_FOUND);
    }

    if (record.userId !== userId) {
      throw new HttpException('No tienes acceso a este registro', HttpStatus.FORBIDDEN);
    }

    return record;
  }

  async update(id: string, userId: string, dto: UpdateIncomeRecordDto) {
    const record = await this.getById(id, userId);

    return this.prisma.incomeRecord.update({
      where: { id: record.id },
      data: {
        ...(dto.sourceType && { sourceType: dto.sourceType }),
        ...(dto.amount && { amount: dto.amount }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.evidenceUrl !== undefined && { evidenceUrl: dto.evidenceUrl }),
        ...(dto.recordDate && { recordDate: new Date(dto.recordDate) }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const record = await this.getById(id, userId);

    await this.prisma.incomeRecord.delete({
      where: { id: record.id },
    });
  }

  async getSummary(userId: string): Promise<IncomeSummary> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const records = await this.prisma.incomeRecord.findMany({
      where: { userId },
      orderBy: { recordDate: 'desc' },
    });

    const totalRecords = records.length;
    const totalAmount = records.reduce((sum, r) => sum + Number(r.amount), 0);
    const averageAmount = totalRecords > 0 ? totalAmount / totalRecords : 0;

    const bySourceTypeMap = new Map<SourceType, { count: number; total: number }>();
    for (const record of records) {
      const existing = bySourceTypeMap.get(record.sourceType) || { count: 0, total: 0 };
      bySourceTypeMap.set(record.sourceType, {
        count: existing.count + 1,
        total: existing.total + Number(record.amount),
      });
    }

    const bySourceType = Array.from(bySourceTypeMap.entries()).map(([sourceType, data]) => ({
      sourceType,
      count: data.count,
      total: data.total,
    }));

    const last30Days = records.filter((r) => r.recordDate >= thirtyDaysAgo);
    const last7Days = records.filter((r) => r.recordDate >= sevenDaysAgo);

    return {
      totalRecords,
      totalAmount,
      averageAmount: Math.round(averageAmount * 100) / 100,
      bySourceType,
      last30Days: {
        count: last30Days.length,
        total: last30Days.reduce((sum, r) => sum + Number(r.amount), 0),
      },
      last7Days: {
        count: last7Days.length,
        total: last7Days.reduce((sum, r) => sum + Number(r.amount), 0),
      },
    };
  }
}