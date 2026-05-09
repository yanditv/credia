import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { LoanRequestsService } from './loan-requests.service';
import { CreateLoanRequestDto } from './dto/create-loan-request.dto';

@ApiTags('loan-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loan-requests')
export class LoanRequestsController {
  constructor(private readonly service: LoanRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar un crédito' })
  @ApiResponse({ status: 201, description: 'Solicitud creada en estado PENDING' })
  @ApiResponse({ status: 400, description: 'Sin score, monto inválido, o monto excede cupo' })
  @ApiResponse({ status: 403, description: 'Score insuficiente para calificar' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateLoanRequestDto) {
    return this.service.create(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Listar mis solicitudes de crédito' })
  @ApiResponse({ status: 200, description: 'Lista ordenada por fecha desc' })
  listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.service.listMine(user.id);
  }
}
