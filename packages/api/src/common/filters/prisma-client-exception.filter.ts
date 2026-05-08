import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

// Mapea errores conocidos de Prisma a HttpException con códigos apropiados.
// Detecta por nombre de clase para no requerir importar @prisma/client antes de
// que Cesar mergee feat/db/prisma-schema. Cuando Prisma esté en uso real, este
// filtro empieza a funcionar automáticamente.

const PRISMA_CODE_MAP: Record<string, [HttpStatus, string]> = {
  P2002: [HttpStatus.CONFLICT, 'El recurso ya existe'],
  P2025: [HttpStatus.NOT_FOUND, 'Recurso no encontrado'],
  P2003: [HttpStatus.BAD_REQUEST, 'Referencia inválida'],
  P2000: [HttpStatus.BAD_REQUEST, 'Valor demasiado largo para el campo'],
};

interface PrismaKnownError {
  name: 'PrismaClientKnownRequestError';
  code: string;
  message: string;
  meta?: unknown;
}

@Catch()
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (this.isPrismaKnownError(exception)) {
      const httpExc = this.toHttpException(exception);
      return super.catch(httpExc, host);
    }
    return super.catch(exception, host);
  }

  private isPrismaKnownError(e: unknown): e is PrismaKnownError {
    return (
      typeof e === 'object' &&
      e !== null &&
      (e as { name?: unknown }).name === 'PrismaClientKnownRequestError' &&
      typeof (e as { code?: unknown }).code === 'string'
    );
  }

  private toHttpException(e: PrismaKnownError): HttpException {
    const [status, message] =
      PRISMA_CODE_MAP[e.code] ?? [HttpStatus.INTERNAL_SERVER_ERROR, 'Error de base de datos'];
    return new HttpException(
      { statusCode: status, message, prismaCode: e.code },
      status,
    );
  }
}
