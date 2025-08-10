import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
// import { efiService } from '@/lib/efi'; // Temporarily disabled for testing

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Temporarily disabled EFI connection test for build testing
    // const testResponse = await efiService.testConnection();

    return NextResponse.json({
      success: true,
      message: 'EFI connection test temporarily disabled',
      data: { status: 'disabled', environment: 'test' },
    });
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
