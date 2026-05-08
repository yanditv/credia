import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsSolanaAddress } from '../../common/validators/is-solana-address.validator';

export class ConnectWalletDto {
  @ApiProperty({
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    description: 'Dirección de wallet Solana (base58 que decodifica a 32 bytes)',
  })
  @IsString()
  @IsSolanaAddress()
  walletAddress!: string;
}
