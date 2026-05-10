import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';

@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RISK_ANALYST')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios (con businessProfile + último score)' })
  @ApiResponse({ status: 200, description: 'Lista ordenada por createdAt desc' })
  list() {
    return this.service.listAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de un usuario' })
  @ApiResponse({ status: 200, description: 'User + businessProfile + último score' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getById(@Param('id') id: string) {
    return this.service.findByIdAdmin(id);
  }
}
