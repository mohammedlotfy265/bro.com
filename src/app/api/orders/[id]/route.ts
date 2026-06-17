import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const COMMISSION_RATE = 0.10; // 10%

// PATCH /api/orders/[id] - update order status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, acceptedDriverId } = body;

    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { shop: true },
    });
    if (!existingOrder) {
      return NextResponse.json({ error: 'الطلب مش موجود' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };
    if (acceptedDriverId) updateData.acceptedDriverId = acceptedDriverId;

    // When order is delivered, calculate commission
    if (status === 'DELIVERED') {
      const deliveryFee = existingOrder.deliveryFee || 0;
      const commission = Math.round(deliveryFee * COMMISSION_RATE * 100) / 100; // 10%
      const driverEarning = Math.round((deliveryFee - commission) * 100) / 100; // 90%

      updateData.commission = commission;

      const order = await db.order.update({
        where: { id },
        data: updateData,
        include: {
          shop: { select: { id: true, name: true, type: true } },
          acceptedDriver: { select: { id: true, name: true, phone: true } },
        },
      });

      // Create earning record
      if (deliveryFee > 0) {
        await db.earning.create({
          data: {
            orderId: id,
            shopId: existingOrder.shopId,
            deliveryFee,
            commission,
            driverEarning,
          },
        });
      }

      return NextResponse.json({
        order,
        commission: { deliveryFee, commission, driverEarning },
      });
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        shop: { select: { id: true, name: true, type: true } },
        acceptedDriver: { select: { id: true, name: true, phone: true } },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
