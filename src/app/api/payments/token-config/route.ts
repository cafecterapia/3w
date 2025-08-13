import { NextResponse } from 'next/server';

export async function GET() {
  const payeeCode = process.env.EFI_PAYEE_CODE || '';
  const rawEnv = (process.env.EFI_ENVIRONMENT || 'sandbox').toLowerCase();
  // Normalize to values supported by payment-token-efi
  const environment: 'sandbox' | 'production' = [
    'prod',
    'producao',
    'production',
    'live',
  ].includes(rawEnv)
    ? 'production'
    : 'sandbox';
  if (!payeeCode) {
    return NextResponse.json(
      { ok: false, message: 'Missing EFI_PAYEE_CODE' },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, payeeCode, environment });
}
