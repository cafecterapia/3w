import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'; // (temporarily not applied due to type issues with count)

// Detect if Accelerate connection string (prisma://) is in use
const useAccelerate =
  process.env.DATABASE_URL?.startsWith('prisma://') ?? false;

// Prevent exhausting database connections in development / hot-reload.
// In production (including Vercel) a new instance per lambda is fine.
// See: https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const base =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// NOTE: Temporarily not extending with Accelerate until type issue with count() resolved
export const prisma = base; // useAccelerate ? base.$extends(withAccelerate()) : base;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = base;
}

export default prisma;
