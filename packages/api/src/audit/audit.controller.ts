import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { AuditService } from './audit.service';

@ApiTags('admin/audit')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RISK_ANALYST')
@Controller('admin/audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoría (paginado, filtrable)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'action', required: false, example: 'LOAN_APPROVED' })
  @ApiQuery({ name: 'userId', required: false, example: 'clx...' })
  @ApiResponse({ status: 200, description: 'Lista paginada de logs' })
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.service.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      action,
      userId,
    });
  }
}