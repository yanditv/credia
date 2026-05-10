import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class UploadService implements OnModuleInit {
  private client: Minio.Client;
  private bucket: string;

  constructor(private readonly config: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.getEndpointHost(),
      port: this.getEndpointPort(),
      useSSL: false,
      accessKey: this.config.getOrThrow<string>('STORAGE_ACCESS_KEY'),
      secretKey: this.config.getOrThrow<string>('STORAGE_SECRET_KEY'),
    });
    this.bucket = this.config.getOrThrow<string>('STORAGE_BUCKET');
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  async upload(file: Express.Multer.File, userId: string): Promise<{ url: string; key: string; contentType: string; size: number }> {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${userId}/${timestamp}-${sanitized}`;

    await this.client.putObject(this.bucket, key, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    // STORAGE_PUBLIC_URL es lo que el navegador del usuario ve.
    // STORAGE_ENDPOINT es solo para que la API hable con MinIO en la red docker.
    // Si no está seteado, fallback a STORAGE_ENDPOINT (dev local: ambos = localhost:9000).
    const publicBase =
      this.config.get<string>('STORAGE_PUBLIC_URL') ??
      this.config.getOrThrow<string>('STORAGE_ENDPOINT');
    const url = `${publicBase.replace(/\/$/, '')}/${this.bucket}/${key}`;

    return { url, key, contentType: file.mimetype, size: file.size };
  }

  private async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
      await this.client.setBucketPolicy(this.bucket, JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      }));
    }
  }

  private getEndpointHost(): string {
    const url = this.config.getOrThrow<string>('STORAGE_ENDPOINT');
    const host = url.replace(/https?:\/\//, '').split(':')[0];
    return host;
  }

  private getEndpointPort(): number {
    const url = this.config.getOrThrow<string>('STORAGE_ENDPOINT');
    const portMatch = url.match(/:(\d+)/);
    return portMatch ? Number(portMatch[1]) : 9000;
  }
}
