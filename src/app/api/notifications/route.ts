import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.read = false;

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, notificationId } = body;

    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    } else if (userId) {
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    }

    return NextResponse.json({ message: 'تم' });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
