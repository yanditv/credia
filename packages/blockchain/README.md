# Blockchain / Anchor Scaffold

Este paquete contiene el programa Anchor de Solana para el módulo de reputación de Credia.

## Arquitectura

- **Cuentas principales:**
  - `UserReputation` — PDA derivado determinísticamente desde el wallet del usuario con seeds `[b"reputation", user_wallet]`
  - Almacena: hash del score, estado de reputación, timestamp, bump

- **ReputationStatus:** `Pending | Active | Suspended`
  - Notas: `Paid` y `Defaulted` son estados de crédito, no de reputación. Se manejan en `LoanRecord` (future).

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
- `programs/credia_reputation/Cargo.toml` (con feature `idl-build`)
- `programs/credia_reputation/src/lib.rs` (instrucción `init_reputation` con PDA)
- `programs/credia_reputation/tests/` (próximos tests aquí)

## Notas importantes

- El programa usa **PDA (Program Derived Address)** para deriving determinístico: `reputation_account = findProgramAddress([b"reputation", user_wallet], program_id)`
- El backend (NestJS `blockchain` module) y el frontend pueden derivar la dirección conociendo solo el wallet del usuario
- **Solo almacena hashes y estados.** No incluir datos personales en la cadena.
- `target/`, `.anchor/` y los keypairs se ignoran en `.gitignore`.
