import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/payments - list payment requests (admin sees all, user sees own)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const role = searchParams.get('role');

    const where: Record<string, unknown> = {};
    if (userId && role !== 'ADMIN') where.userId = userId;
    if (status) where.status = status;

    const payments = await db.paymentRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true, points: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// POST /api/payments - create payment request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amount, paymentMethod, senderPhone, senderName, receiptNumber } = body;

    if (!userId || !amount || !paymentMethod || !senderPhone || !senderName) {
      return NextResponse.json({ error: 'كل البيانات مطلوبة' }, { status: 400 });
    }

    if (!['VODAFONE_CASH', 'INSTAPAY', 'ORANGE_CASH'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'طريقة الدفع مش صحيحة' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'عدد النقاط لازم يكون أكتر من صفر' }, { status: 400 });
    }

    const payment = await db.paymentRequest.create({
      data: {
        userId,
        amount,
        paymentMethod,
        senderPhone,
        senderName,
        receiptNumber: receiptNumber || null,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'حصل خطأ في إنشاء طلب الدفع' }, { status: 500 });
  }
}
