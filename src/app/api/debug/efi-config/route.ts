import { NextRequest, NextResponse } from 'next/server';
import { getEfiConfigStatus, validateEfiConfig } from '@/lib/efi';

// Optional: mark as node runtime (cert/temp file logic expects fs/os access)
export const runtime = 'nodejs';

/**
 * Debug endpoint to inspect (non-secret) Efí configuration status.
 * Protected: requires INTERNAL_API_KEY header in production.
 * Returns only booleans/paths; never raw secrets.
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const keyHeader = req.headers.get('x-internal-key');
    const expected = process.env.INTERNAL_API_KEY;
    if (!expected || keyHeader !== expected) {
      return NextResponse.json(
        { success: false, message: 'Not found' },
        { status: 404 }
      );
    }
  }

  const status = getEfiConfigStatus();
  const validation = validateEfiConfig();
  return NextResponse.json({ success: true, status, validation });
}
