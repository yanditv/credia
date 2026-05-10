import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumberString, IsString, MaxLength, MinLength } from 'class-validator';
import { VALID_TERM_DAYS, ValidTermDays } from '../helpers/score-cupos';

export class CreateLoanRequestDto {
  @ApiProperty({
    example: '100.00',
    description: 'Monto solicitado en USDC, sin signo, dos decimales',
  })
  @IsNumberString({ no_symbols: false })
  requestedAmount!: string;

  @ApiProperty({
    enum: VALID_TERM_DAYS,
    example: 30,
    description: 'Plazo en días (7, 15 o 30)',
  })
  @IsInt()
  @IsIn(VALID_TERM_DAYS as readonly number[])
  termDays!: ValidTermDays;

  @ApiProperty({
    example: 'Ampliar inventario de frutas para feria de fin de mes',
    description: 'Propósito del crédito (10-280 chars)',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(280)
  purpose!: string;
}
