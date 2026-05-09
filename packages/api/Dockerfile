FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY packages/api/package.json packages/api/package.json
COPY packages/blockchain/package.json packages/blockchain/package.json
COPY packages/blockchain/tsconfig.json packages/blockchain/tsconfig.json
RUN npm ci --ignore-scripts

COPY packages/api/prisma packages/api/prisma
RUN npx prisma generate --schema packages/api/prisma/schema.prisma

COPY packages/api packages/api
COPY packages/blockchain packages/blockchain
RUN npm run build -w @credia/api

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/dist packages/api/dist
COPY --from=builder /app/packages/api/package.json packages/api/package.json
COPY packages/api/prisma packages/api/prisma
EXPOSE 3001
CMD ["node", "packages/api/dist/main.js"]