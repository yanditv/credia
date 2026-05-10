import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumberString, IsString, MaxLength, Min, MinLength } from 'class-validator';

export const BUSINESS_TYPES = [
  'VENDOR',
  'MERCHANT',
  'DELIVERY',
  'TAXI',
  'STORE',
  'SERVICES',
  'AGRICULTURE',
  'OTHER',
] as const;

export type BusinessTypeEnum = (typeof BUSINESS_TYPES)[number];

export class CreateBusinessProfileDto {
  @ApiProperty({ example: 'Frutería La Mariscal' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  businessName!: string;

  @ApiProperty({ enum: BUSINESS_TYPES, example: 'VENDOR' })
  @IsEnum(BUSINESS_TYPES)
  businessType!: BusinessTypeEnum;

  @ApiProperty({ example: 'Cuenca' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  city!: string;

  @ApiProperty({
    example: '450.00',
    description: 'Decimal serializado como string (compatible con Prisma Decimal)',
  })
  @IsNumberString({ no_symbols: false })
  monthlyEstimatedIncome!: string;

  @ApiProperty({ example: 3, minimum: 0 })
  @IsInt()
  @Min(0)
  yearsActive!: number;
}
