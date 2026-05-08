import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'María García' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  documentNumber!: string;

  @ApiProperty({ example: '+593990000000' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: 'maria@credia.io' })
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @ApiProperty({ example: 'securePassword123', description: 'Mínimo 8 caracteres' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}