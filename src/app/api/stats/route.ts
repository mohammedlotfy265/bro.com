import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/stats - dashboard stats
export async function GET() {
  try {
    const [totalShops, totalDrivers, totalOrders, pendingOrders, deliveredOrders, totalUsers] =
      await Promise.all([
        db.shop.count(),
        db.user.count({ where: { role: 'DRIVER' } }),
        db.order.count(),
        db.order.count({ where: { status: { in: ['PENDING', 'OFFERED'] } } }),
        db.order.count({ where: { status: 'DELIVERED' } }),
        db.user.count(),
      ]);

    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        shop: { select: { name: true, type: true } },
        acceptedDriver: { select: { name: true } },
      },
    });

    return NextResponse.json({
      stats: {
        totalShops,
        totalDrivers,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalUsers,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
