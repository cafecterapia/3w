import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'; // (temporarily not applied due to type issues with count)

// --- Dynamic env fallback (Vercel Postgres compatibility) -------------------
// Vercel Postgres integration exposes POSTGRES_PRISMA_URL (and POSTGRES_URL, POSTGRES_URL_NON_POOLING)
// while Prisma schema here expects DATABASE_URL / DIRECT_DATABASE_URL.
// Provide runtime mapping so we don't have to rename in dashboard.
if (!process.env.DATABASE_URL) {
  const candidate =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (candidate) process.env.DATABASE_URL = candidate;
}
if (!process.env.DIRECT_DATABASE_URL) {
  const directCandidate =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;
  if (directCandidate) process.env.DIRECT_DATABASE_URL = directCandidate;
}

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
