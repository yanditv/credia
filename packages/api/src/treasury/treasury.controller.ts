import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { BlockchainService } from '../blockchain/blockchain.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RISK_ANALYST')
@Controller('admin/treasury')
export class TreasuryController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('balance')
  @ApiOperation({
    summary: 'Saldo SOL + USDC del ADMIN_KEYPAIR (treasury de desembolsos)',
  })
  @ApiResponse({ status: 200, description: 'Saldo del admin keypair' })
  async getBalance() {
    const address = await this.blockchainService.getAdminAddress();
    return this.blockchainService.getWalletBalance(address);
  }
}
