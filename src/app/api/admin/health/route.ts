import { NextResponse } from 'next/server';
import { getEfiConfigStatus, validateEfiConfig } from '@/lib/efi';
import prisma from '@/lib/prisma';

export async function GET() {
  const start = Date.now();
  const dbCheck = await prisma.$queryRaw`SELECT 1 as ok`
    .then(() => true)
    .catch(() => false);
  const efiStatus = getEfiConfigStatus();
  const efiValidation = validateEfiConfig();
  const uptime = process.uptime();
  return NextResponse.json({
    ok: dbCheck && efiValidation.ok,
    db: dbCheck ? 'up' : 'down',
    efi: { ...efiStatus, ok: efiValidation.ok, issues: efiValidation.issues },
    uptimeSeconds: Math.round(uptime),
    elapsedMs: Date.now() - start,
  });
}
