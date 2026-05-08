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
}
