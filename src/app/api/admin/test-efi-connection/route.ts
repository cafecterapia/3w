import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { efiService } from '@/lib/efi';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testResponse = await efiService.testConnection();
    return NextResponse.json({ success: true, data: testResponse });
  } catch (error) {
    console.error('EFI connection test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'EFI connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
