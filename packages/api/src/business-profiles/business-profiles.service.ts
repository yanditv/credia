import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessProfileDto } from './dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';

// Errores de Prisma (P2002 conflict, P2025 not found, etc.) se mapean centralmente
// vía PrismaClientExceptionFilter — no hace falta try/catch en cada método.

@Injectable()
export class BusinessProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new HttpException('Aún no tienes perfil de negocio creado', HttpStatus.NOT_FOUND);
    }
    return profile;
  }

  async create(userId: string, dto: CreateBusinessProfileDto) {
    const existing = await this.prisma.businessProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new HttpException('Ya tienes un perfil de negocio', HttpStatus.CONFLICT);
    }
    return this.prisma.businessProfile.create({ data: { ...dto, userId } });
  }

  async update(userId: string, dto: UpdateBusinessProfileDto) {
    await this.getMine(userId);
    return this.prisma.businessProfile.update({ where: { userId }, data: dto });
  }
}
