import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In dev, the Prisma client is recreated whenever this module is re-executed (e.g. HMR) so
// we never keep a pre-generate `PrismaClient` instance that is missing new models. After
// `npx prisma generate`, you still need a full dev server restart if Node is holding a stale
// @prisma/client require cache.
if (process.env.NODE_ENV === 'development') {
  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect().catch(() => {})
  }
  globalForPrisma.prisma = new PrismaClient()
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
}

export const db = globalForPrisma.prisma
