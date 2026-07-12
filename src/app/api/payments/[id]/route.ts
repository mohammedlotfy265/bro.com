import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/payments/[id] - approve or reject payment request (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminNote, adminRole } = body;

    if (adminRole !== 'ADMIN') {
      return NextResponse.json({ error: 'مسموح للأدمن بس' }, { status: 403 });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'الحالة لازم تكون APPROVED أو REJECTED' }, { status: 400 });
    }

    const payment = await db.paymentRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'طلب الدفع مش موجود' }, { status: 404 });
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'طلب الدفع ده اتعمل عليه إجراء قبل كده' }, { status: 400 });
    }

    // Update payment request
    const updatedPayment = await db.paymentRequest.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || null,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, phone: true, points: true } },
      },
    });

    // If approved, add points to user and create transaction
    if (status === 'APPROVED') {
      await db.user.update({
        where: { id: payment.userId },
        data: { points: { increment: payment.amount } },
      });

      await db.pointsTransaction.create({
        data: {
          userId: payment.userId,
          amount: payment.amount,
          type: 'PURCHASE',
          description: `شراء ${payment.amount} نقطة عبر ${getPaymentMethodLabel(payment.paymentMethod)}`,
        },
      });
    }

    return NextResponse.json({ payment: updatedPayment });
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    VODAFONE_CASH: 'فودافون كاش',
    INSTAPAY: 'إنستاباي',
    ORANGE_CASH: 'أورنج كاش',
  };
  return labels[method] || method;
}
