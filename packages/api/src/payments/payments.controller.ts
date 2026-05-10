import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans/:loanId/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pagos de un crédito' })
  @ApiResponse({ status: 200, description: 'Lista de pagos ordenada por fecha desc' })
  @ApiResponse({ status: 403, description: 'No es tu crédito' })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  list(@CurrentUser() user: CurrentUserPayload, @Param('loanId') loanId: string) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'RISK_ANALYST';
    return this.service.listForLoan(loanId, user.id, isAdmin);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un pago de un crédito' })
  @ApiResponse({ status: 201, description: 'Pago registrado (PENDING para USDC_ON_CHAIN, COMPLETED para CASH/TRANSFER)' })
  @ApiResponse({ status: 400, description: 'Monto inválido' })
  @ApiResponse({ status: 403, description: 'No es tu crédito' })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  @ApiResponse({ status: 409, description: 'El crédito no está activo' })
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param('loanId') loanId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'RISK_ANALYST';
    return this.service.create(loanId, user.id, isAdmin, dto);
  }
}
