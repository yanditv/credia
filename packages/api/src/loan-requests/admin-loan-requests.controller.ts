import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoanRequestStatus } from '@prisma/client';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { LoanRequestsService } from './loan-requests.service';
import { RejectLoanRequestDto } from './dto/reject-loan-request.dto';

@ApiTags('admin/loan-requests')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RISK_ANALYST')
@Controller('admin/loan-requests')
export class AdminLoanRequestsController {
  constructor(private readonly service: LoanRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las solicitudes (filtrable por status)' })
  @ApiQuery({ name: 'status', enum: LoanRequestStatus, required: false })
  @ApiResponse({ status: 200, description: 'Lista con datos del usuario' })
  list(@Query('status') status?: LoanRequestStatus) {
    return this.service.listAll({ status });
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Aprobar solicitud y crear el Loan asociado' })
  @ApiResponse({ status: 200, description: 'Aprobada — devuelve loanRequest + loan creado' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({ status: 409, description: 'Solicitud ya procesada' })
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rechazar solicitud' })
  @ApiResponse({ status: 200, description: 'Rechazada' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({ status: 409, description: 'Solicitud ya procesada' })
  reject(@Param('id') id: string, @Body() dto: RejectLoanRequestDto) {
    return this.service.reject(id, dto);
  }
}
