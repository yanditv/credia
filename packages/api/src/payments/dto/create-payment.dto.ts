import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export const PAYMENT_METHODS = ['CASH', 'TRANSFER', 'USDC_ON_CHAIN'] as const;
export type PaymentMethodEnum = (typeof PAYMENT_METHODS)[number];

export class CreatePaymentDto {
  @ApiProperty({
    example: '50.00',
    description: 'Monto del pago en USDC, dos decimales',
  })
  @IsNumberString({ no_symbols: false })
  amount!: string;

  @ApiProperty({
    enum: PAYMENT_METHODS,
    example: 'CASH',
    description:
      'Método de pago. CASH/TRANSFER quedan como COMPLETED inmediato; USDC_ON_CHAIN queda PENDING hasta confirmar tx en Solana',
  })
  @IsEnum(PAYMENT_METHODS)
  paymentMethod!: PaymentMethodEnum;

  @ApiProperty({
    required: false,
    description: 'Tx signature de Solana (solo aplica para USDC_ON_CHAIN)',
  })
  @IsOptional()
  @IsString()
  blockchainTx?: string;
}
