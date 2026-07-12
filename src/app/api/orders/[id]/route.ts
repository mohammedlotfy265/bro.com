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
    const { status, acceptedDriverId, action } = body;

    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { shop: true },
    });
    if (!existingOrder) {
      return NextResponse.json({ error: 'الطلب مش موجود' }, { status: 404 });
    }

    // ============== DIRECT ACCEPT ==============
    // Driver accepts the shop's price directly (no offer created)
    if (action === 'directAccept' && acceptedDriverId) {
      // Validate order is still available
      if (!['PENDING', 'OFFERED'].includes(existingOrder.status)) {
        return NextResponse.json({ error: 'الطلب ده مش متاح' }, { status: 400 });
      }

      // Check driver exists and has enough points
      const driver = await db.user.findUnique({ where: { id: acceptedDriverId } });
      if (!driver) {
        return NextResponse.json({ error: 'الدليفري مش موجود' }, { status: 404 });
      }

      const price = existingOrder.deliveryFee || 0;
      const commissionPoints = Math.max(1, Math.ceil(price * 0.10)); // 10% of shop price
      if (driver.points < commissionPoints) {
        return NextResponse.json({
          error: `معندكش نقاط كافية. عمولة القبول = ${commissionPoints} نقطة. عندك ${driver.points} نقطة بس. اشتري نقاط الأول`,
        }, { status: 400 });
      }

      // Check driver hasn't already offered on this order
      const existingOffer = await db.deliveryOffer.findFirst({
        where: { orderId: id, driverId: acceptedDriverId },
      });
      if (existingOffer) {
        return NextResponse.json({ error: 'أنت عملت عرض على الطلب ده قبل كده' }, { status: 409 });
      }

      // Assign driver to order directly
      const order = await db.order.update({
        where: { id },
        data: { status: 'ACCEPTED', acceptedDriverId },
        include: {
          shop: { select: { id: true, name: true, type: true } },
          acceptedDriver: { select: { id: true, name: true, phone: true } },
        },
      });

      // Reject all other pending offers for this order
      await db.deliveryOffer.updateMany({
        where: { orderId: id, status: 'PENDING' },
        data: { status: 'REJECTED' },
      });

      // Deduct 10% commission points from driver
      const actualDeduction = Math.min(commissionPoints, driver.points);
      await db.user.update({
        where: { id: acceptedDriverId },
        data: { points: { decrement: actualDeduction } },
      });

      await db.pointsTransaction.create({
        data: {
          userId: acceptedDriverId,
          amount: -actualDeduction,
          type: 'USAGE',
          description: `عمولة 10% على قبول توصيل طلب #${id.slice(-6)} (${actualDeduction} نقطة = 10% من ${price} ج.م)`,
        },
      });

      return NextResponse.json({
        order,
        directAccept: true,
        deductedPoints: actualDeduction,
        remainingPoints: driver.points - actualDeduction,
      });
    }

    // ============== NORMAL STATUS UPDATE ==============
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
