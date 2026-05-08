import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ example: '1h' })
  expiresIn!: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'cmoxbmcv10000ifzga1dc4zr5' })
  id!: string;

  @ApiProperty({ example: 'María García' })
  fullName!: string;

  @ApiProperty({ example: 'maria@credia.io' })
  email!: string;

  @ApiProperty({ example: 'USER' })
  role!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}