import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectLoanRequestDto {
  @ApiPropertyOptional({
    example: 'Score insuficiente para el monto solicitado',
    description: 'Razón opcional del rechazo (queda en logs/auditoría)',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(280)
  reason?: string;
}
