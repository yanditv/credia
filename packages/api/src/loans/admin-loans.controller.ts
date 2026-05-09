import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoanStatus } from '@prisma/client';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { LoansService } from './loans.service';

@ApiTags('admin/loans')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RISK_ANALYST')
@Controller('admin/loans')
export class AdminLoansController {
  constructor(private readonly service: LoansService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los créditos (filtrable por status)' })
  @ApiQuery({ name: 'status', enum: LoanStatus, required: false })
  @ApiResponse({ status: 200, description: 'Lista con datos del usuario' })
  list(@Query('status') status?: LoanStatus) {
    return this.service.listAll({ status });
  }
}
