import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get admin dashboard data
    const [totalUsers, totalSubscribers, activeSubscriptions, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            subscriptionStatus: {
              not: null,
            },
          },
        }),
        prisma.user.count({
          where: {
            subscriptionStatus: 'active',
          },
        }),
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionStatus: true,
          },
          take: 10,
          orderBy: {
            email: 'desc',
          },
        }),
      ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSubscribers,
        activeSubscriptions,
      },
      recentUsers,
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check authentication and admin role
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, userId, data } = body;

    switch (action) {
      case 'updateUserRole':
        if (!userId || !data?.role) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        // TODO: Implement role update when Prisma types are updated
        return NextResponse.json(
          { error: 'Role update not implemented yet' },
          { status: 501 }
        );

      case 'deleteUser':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID required' },
            { status: 400 }
          );
        }

        await prisma.user.delete({
          where: { id: userId },
        });

        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
