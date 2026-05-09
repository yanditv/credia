import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024;

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Formato no permitido. Usá JPG, PNG, WebP o PDF (máx 5 MB)'), false);
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Subir comprobante o documento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo (JPG, PNG, WebP o PDF, máx 5 MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: UploadResponseDto, description: 'Archivo subido correctamente' })
  @ApiResponse({ status: 400, description: 'Formato no permitido o archivo demasiado grande' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }

    return this.service.upload(file, user.id);
  }
}
