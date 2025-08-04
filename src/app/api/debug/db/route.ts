import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Testing database connection from Next.js API...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test user query
    console.log('🔍 Testing user findUnique query...');
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    console.log('✅ User query successful:', user);

    // Test user count
    const userCount = await prisma.user.count();
    console.log('✅ User count query successful:', userCount);

    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      userCount,
      testUser: user,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
