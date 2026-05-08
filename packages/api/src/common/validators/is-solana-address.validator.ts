import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import bs58 from 'bs58';

// Valida que un string sea una dirección Solana válida: base58 que decodifique a 32 bytes.
// No valida que esté en la curva ed25519 (lo cual descartaría PDAs); para wallets de
// usuario regulares (Phantom/Solflare) la longitud + base58 es el criterio práctico.

export function IsSolanaAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSolanaAddress',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          try {
            return bs58.decode(value).length === 32;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} debe ser una dirección Solana válida (32 bytes en base58)`;
        },
      },
    });
  };
}
