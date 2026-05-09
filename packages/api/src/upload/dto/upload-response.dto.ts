import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'http://localhost:9000/credia-docs/user123/photo.jpg' })
  url!: string;

  @ApiProperty({ example: 'user123/1712345678-photo.jpg' })
  key!: string;

  @ApiProperty({ example: 'image/jpeg' })
  contentType!: string;

  @ApiProperty({ example: 102400 })
  size!: number;
}
