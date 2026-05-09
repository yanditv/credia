import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { IncomeRecordsService } from './income-records.service';
import { CreateIncomeRecordDto } from './dto/create-income-record.dto';
import { UpdateIncomeRecordDto } from './dto/update-income-record.dto';

@ApiTags('income-records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('income-records')
export class IncomeRecordsController {
  constructor(private readonly service: IncomeRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo ingreso' })
  @ApiResponse({ status: 201, description: 'Ingreso registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateIncomeRecordDto) {
    return this.service.create(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Listar mis registros de ingresos' })
  @ApiResponse({ status: 200, description: 'Lista de ingresos ordenada por fecha' })
  listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.service.listMine(user.id);
  }

  @Get('me/summary')
  @ApiOperation({ summary: 'Obtener resumen estadístico de ingresos' })
  @ApiResponse({ status: 200, description: 'Estadísticas de ingresos' })
  getSummary(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getSummary(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de ingreso por ID' })
  @ApiResponse({ status: 200, description: 'Registro de ingreso' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.service.getById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de ingreso' })
  @ApiResponse({ status: 200, description: 'Registro actualizado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateIncomeRecordDto,
  ) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de ingreso' })
  @ApiResponse({ status: 200, description: 'Registro eliminado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.service.delete(id, user.id);
  }
}