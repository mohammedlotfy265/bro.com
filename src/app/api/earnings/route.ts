import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/earnings - admin earnings dashboard
export async function GET() {
  try {
    // Total earnings
    const totalEarnings = await db.earning.aggregate({
      _sum: { commission: true, deliveryFee: true, driverEarning: true },
      _count: true,
    });

    // Recent earnings
    const recentEarnings = await db.earning.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { description: true } },
        shop: { select: { name: true, type: true } },
      },
    });

    // Earnings by shop
    const earningsByShop = await db.earning.groupBy({
      by: ['shopId'],
      _sum: { commission: true, deliveryFee: true },
      _count: true,
    });

    // Get shop names for the grouped data
    const shopIds = earningsByShop.map((e) => e.shopId);
    const shops = await db.shop.findMany({
      where: { id: { in: shopIds } },
      select: { id: true, name: true, type: true },
    });

    const shopMap = new Map(shops.map((s) => [s.id, s]));
    const earningsByShopWithNames = earningsByShop.map((e) => ({
      ...e,
      shop: shopMap.get(e.shopId) || { name: 'محل محذوف', type: 'OTHER' },
    }));

    // Today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEarnings = await db.earning.aggregate({
      _sum: { commission: true },
      _count: true,
      where: { createdAt: { gte: today } },
    });

    // This month's earnings
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEarnings = await db.earning.aggregate({
      _sum: { commission: true },
      _count: true,
      where: { createdAt: { gte: monthStart } },
    });

    return NextResponse.json({
      totalCommission: totalEarnings._sum.commission || 0,
      totalDeliveryFees: totalEarnings._sum.deliveryFee || 0,
      totalDriverEarnings: totalEarnings._sum.driverEarning || 0,
      totalDeliveries: totalEarnings._count || 0,
      todayCommission: todayEarnings._sum.commission || 0,
      todayDeliveries: todayEarnings._count || 0,
      monthCommission: monthEarnings._sum.commission || 0,
      monthDeliveries: monthEarnings._count || 0,
      commissionRate: 10,
      recentEarnings,
      earningsByShop: earningsByShopWithNames,
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
