# Blockchain / Anchor Scaffold

Este paquete contiene el programa Anchor de Solana para el módulo de reputación de Credia.

## Setup inicial

1. Asegurar Solana CLI y Anchor 0.31 instalados:
   ```bash
   solana --version
   anchor --version
   ```

2. Configurar Devnet:
   ```bash
   solana config set --url devnet
   solana airdrop 2
   ```

3. Generar keypair local si no existe:
   ```bash
   solana-keygen new --outfile ~/.config/solana/id.json --force
   ```

4. Construir el programa:
   ```bash
   cd packages/blockchain
   anchor build
   ```

5. Desplegar en devnet:
   ```bash
   anchor deploy
   ```

6. Actualizar el `Program ID` en `packages/blockchain/programs/credia_reputation/src/lib.rs` y en `packages/blockchain/Anchor.toml` después del deploy.

## Estructura creada

- `Anchor.toml`
- `programs/credia_reputation/Cargo.toml`
- `programs/credia_reputation/src/lib.rs`

## Notas

- El programa de Anchor solo almacena hashes y estados. No incluir datos personales en la cadena.
- `target/`, `.anchor/` y los keypairs se ignoran en `.gitignore`.
