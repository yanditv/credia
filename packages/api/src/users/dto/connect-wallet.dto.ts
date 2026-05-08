import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class ConnectWalletDto {
  @ApiProperty({
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    description: 'Dirección de wallet Solana en base58 (32-44 caracteres)',
  })
  @IsString()
  @Length(32, 44)
  @Matches(/^[1-9A-HJ-NP-Za-km-z]+$/, {
    message: 'walletAddress debe ser un string base58 válido',
  })
  walletAddress!: string;
}
