import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/orders/[id] - update order status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, acceptedDriverId } = body;

    const existingOrder = await db.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ error: 'الطلب مش موجود' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };
    if (acceptedDriverId) updateData.acceptedDriverId = acceptedDriverId;

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
