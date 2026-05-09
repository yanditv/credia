import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { ScoresService } from './scores.service';

@ApiTags('admin/scores')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RISK_ANALYST')
@Controller('admin/scores')
export class AdminScoresController {
  constructor(private readonly service: ScoresService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obtener historial de scores de un usuario (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de scores del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getByUser(@Param('userId') userId: string) {
    return this.service.listMine(userId);
  }
}