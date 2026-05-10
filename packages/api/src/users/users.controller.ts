import { BadRequestException, Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { BlockchainService } from '../blockchain/blockchain.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Datos del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getMe(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  updateMe(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/wallet')
  @ApiOperation({ summary: 'Vincular wallet Solana al usuario' })
  @ApiResponse({ status: 201, description: 'Wallet vinculada' })
  @ApiResponse({ status: 400, description: 'Wallet inválida' })
  connectWallet(@CurrentUser() user: CurrentUserPayload, @Body() dto: ConnectWalletDto) {
    return this.usersService.connectWallet(user.id, dto);
  }

  @Get('me/wallet/balance')
  @ApiOperation({ summary: 'Saldo SOL + USDC de la wallet vinculada en Solana' })
  @ApiResponse({ status: 200, description: 'Saldo on-chain' })
  @ApiResponse({ status: 400, description: 'Usuario sin wallet vinculada' })
  async getWalletBalance(@CurrentUser() user: CurrentUserPayload) {
    const me = await this.usersService.findById(user.id);
    if (!me.walletAddress) {
      throw new BadRequestException('No tenés una wallet vinculada todavía');
    }
    return this.blockchainService.getWalletBalance(me.walletAddress);
  }
}
