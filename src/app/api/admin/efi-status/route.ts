import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEfiConfigStatus, validateEfiConfig, efiService } from '@/lib/efi';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = getEfiConfigStatus();
  const validation = validateEfiConfig();

  // Optionally attempt a lightweight connection test only if config passes basic validation
  let connectivity: { ok: boolean; message: string } = { ok: false, message: 'Skipped due to config issues' };
  if (validation.ok) {
    try {
      await efiService.testConnection();
      connectivity = { ok: true, message: 'Connection successful' };
    } catch (err: any) {
      connectivity = { ok: false, message: err?.message || 'Connection failed' };
    }
  }

  return NextResponse.json({ status, validation, connectivity });
}
