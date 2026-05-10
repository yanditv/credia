import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { PaymentsService } from './payments.service';

// Listado plano de los pagos del usuario autenticado a través de TODOS sus
// créditos. Complementa /loans/:loanId/payments que es per-loan.

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class MyPaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Listar todos mis pagos (a través de todos mis créditos)' })
  @ApiResponse({ status: 200, description: 'Lista con datos del loan asociado' })
  listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.service.listMineAcrossLoans(user.id);
  }
}
