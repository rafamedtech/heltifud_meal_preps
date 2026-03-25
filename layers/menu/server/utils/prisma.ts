import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { PrismaClient } from '~~/layers/menu/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let pool: pg.Pool | undefined;
let prismaClient: PrismaClient | undefined;

function getDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL es requerido para inicializar Prisma.');
  }

  return connectionString;
}

function createPrismaClient() {
  pool ??= new pg.Pool({ connectionString: getDatabaseUrl() });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    transactionOptions: {
      maxWait: 10_000,
      timeout: 20_000,
    },
  });
}

function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  prismaClient ??= createPrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient;
  }

  return prismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getPrismaClient(), property, receiver);
  },
}) as PrismaClient;
