import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders - list orders (with filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const status = searchParams.get('status');
    const driverId = searchParams.get('driverId');

    const where: Record<string, unknown> = {};
    if (shopId) where.shopId = shopId;
    if (status) where.status = status;
    if (driverId) where.acceptedDriverId = driverId;

    // For drivers: show PENDING and OFFERED orders that they haven't offered on yet
    if (driverId && status === 'AVAILABLE') {
      delete where.status;
      delete where.acceptedDriverId;
      where.status = { in: ['PENDING', 'OFFERED'] };
    }

    const orders = await db.order.findMany({
      where,
      include: {
        shop: { select: { id: true, name: true, type: true, address: true, phone: true } },
        createdBy: { select: { id: true, name: true } },
        acceptedDriver: { select: { id: true, name: true, phone: true } },
        offers: {
          include: { driver: { select: { id: true, name: true, phone: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If driver is looking for available orders, filter out ones they already offered
    let filteredOrders = orders;
    if (driverId && status === 'AVAILABLE') {
      filteredOrders = orders.filter(
        (order) => !order.offers.some((offer) => offer.driverId === driverId)
      );
    }

    return NextResponse.json({ orders: filteredOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// POST /api/orders - create order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopId, description, pickupAddress, deliveryAddress, deliveryFee, pointsCost, createdById } = body;

    if (!shopId || !description || !pickupAddress || !deliveryAddress || !createdById) {
      return NextResponse.json({ error: 'كل البيانات مطلوبة' }, { status: 400 });
    }

    const order = await db.order.create({
      data: {
        shopId,
        description,
        pickupAddress,
        deliveryAddress,
        deliveryFee: deliveryFee || 0,
        pointsCost: pointsCost || 1,
        createdById,
        status: 'PENDING',
      },
      include: {
        shop: { select: { id: true, name: true, type: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'حصل خطأ في إنشاء الطلب' }, { status: 500 });
  }
}
