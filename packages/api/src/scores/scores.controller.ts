import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { ScoresService } from './scores.service';

@ApiTags('scores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scores')
export class ScoresController {
  constructor(private readonly service: ScoresService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calcular score financiero del usuario' })
  @ApiResponse({ status: 201, description: 'Score calculado y guardado' })
  @ApiResponse({ status: 400, description: 'No hay suficientes datos para calcular' })
  calculate(@CurrentUser() user: CurrentUserPayload) {
    return this.service.calculate(user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Listar historial de scores' })
  @ApiResponse({ status: 200, description: 'Lista de scores ordenados por fecha' })
  listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.service.listMine(user.id);
  }

  @Get('me/latest')
  @ApiOperation({ summary: 'Obtener el último score' })
  @ApiResponse({ status: 200, description: 'Último score del usuario' })
  @ApiResponse({ status: 404, description: 'No se encontró score' })
  getLatest(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getLatest(user.id);
  }
}