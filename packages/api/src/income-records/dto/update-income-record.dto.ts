import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDecimal, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SourceType } from '@prisma/client';

export class UpdateIncomeRecordDto {
  @ApiProperty({
    enum: SourceType,
    example: 'DAILY_SALES',
    description: 'Tipo de fuente del ingreso',
    required: false,
  })
  @IsEnum(SourceType)
  @IsOptional()
  sourceType?: SourceType;

  @ApiProperty({
    example: '45.50',
    description: 'Monto del ingreso en USDC',
    required: false,
  })
  @IsDecimal({ decimal_digits: '2', locale: 'en-US' })
  @IsOptional()
  amount?: string;

  @ApiProperty({
    example: 'Venta de frutas en el mercado',
    description: 'Descripción opcional del ingreso',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(280)
  description?: string;

  @ApiProperty({
    example: 'https://ejemplo.com/evidencia.jpg',
    description: 'URL de evidencia (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  evidenceUrl?: string;

  @ApiProperty({
    example: '2026-05-08T00:00:00.000Z',
    description: 'Fecha del registro de ingreso',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  recordDate?: string;
}