import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { PaymentsService } from './payments.service';

@ApiTags('admin/payments')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RISK_ANALYST')
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los pagos (filtrable por status y método)' })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'method', enum: PaymentMethod, required: false })
  @ApiResponse({ status: 200, description: 'Lista con loan + user joined' })
  list(
    @Query('status') status?: PaymentStatus,
    @Query('method') method?: PaymentMethod,
  ) {
    return this.service.listAllAdmin({ status, method });
  }
}
