import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { LoansService } from './loans.service';

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly service: LoansService) {}

  @Get('me')
  @ApiOperation({ summary: 'Listar mis créditos (activos y cerrados)' })
  @ApiResponse({ status: 200, description: 'Lista ordenada por fecha desc' })
  listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.service.listMine(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un crédito específico (debe ser propio o admin)' })
  @ApiResponse({ status: 200, description: 'Crédito con sus pagos' })
  @ApiResponse({ status: 403, description: 'No es tu crédito' })
  @ApiResponse({ status: 404, description: 'No existe' })
  getById(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'RISK_ANALYST';
    return this.service.getById(id, user.id, isAdmin);
  }
}
