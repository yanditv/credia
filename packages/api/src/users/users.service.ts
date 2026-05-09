import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';

// Errores de Prisma (P2002 conflict, P2025 not found, etc.) se mapean centralmente
// vía PrismaClientExceptionFilter — no hace falta try/catch en cada método.

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async connectWallet(id: string, dto: ConnectWalletDto) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { walletAddress: dto.walletAddress },
    });
  }

  // Selects que excluyen passwordHash. Crítico para no leakear hashes vía /admin/users.
  private readonly USER_SAFE_SELECT = {
    id: true,
    fullName: true,
    documentNumber: true,
    phone: true,
    email: true,
    walletAddress: true,
    role: true,
    status: true,
    createdAt: true,
  } as const;

  async listAllAdmin() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        ...this.USER_SAFE_SELECT,
        businessProfile: {
          select: { businessName: true, businessType: true, city: true },
        },
        creditScores: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { score: true, riskLevel: true, maxCreditAmount: true },
        },
      },
    });
  }

  async findByIdAdmin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...this.USER_SAFE_SELECT,
        businessProfile: true,
        creditScores: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
