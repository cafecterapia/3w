import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import prisma from '@/lib/prisma';

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:test@example.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check - you might want to implement API key validation
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, message, data } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, message' },
        { status: 400 }
      );
    }

    // Retrieve user's push subscription from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    if (!user || !user.pushSubscription) {
      return NextResponse.json(
        { error: 'User not found or no push subscription' },
        { status: 404 }
      );
    }

    const pushSubscription = JSON.parse(user.pushSubscription);

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data || {},
    });

    // Send push notification
    await webpush.sendNotification(pushSubscription, payload);

    console.log('Push notification sent to user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Push notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
}
