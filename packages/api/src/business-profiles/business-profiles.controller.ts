import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { BusinessProfilesService } from './business-profiles.service';
import { CreateBusinessProfileDto } from './dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';

@ApiTags('business-profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-profile')
export class BusinessProfilesController {
  constructor(private readonly service: BusinessProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil de negocio propio' })
  @ApiResponse({ status: 200, description: 'Perfil de negocio' })
  @ApiResponse({ status: 404, description: 'Aún no creado' })
  getMine(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getMine(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear perfil de negocio' })
  @ApiResponse({ status: 201, description: 'Perfil creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un perfil' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateBusinessProfileDto) {
    return this.service.create(user.id, dto);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil de negocio propio' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado' })
  @ApiResponse({ status: 404, description: 'No existe perfil' })
  update(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateBusinessProfileDto) {
    return this.service.update(user.id, dto);
  }
}
