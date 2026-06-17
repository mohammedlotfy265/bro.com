import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings/payment-methods - get admin payment info (public for users to see where to send)
export async function GET() {
  try {
    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, phone: true },
    });

    return NextResponse.json({
      paymentMethods: [
        {
          id: 'VODAFONE_CASH',
          name: 'فودافون كاش',
          icon: '📱',
          color: 'from-red-500 to-red-600',
          accountName: admin?.name || 'المدير',
          accountPhone: admin?.phone || '01000000000',
          instructions: 'حوّل المبلغ على رقم فودافون كاش ده واكتب رقم الإيصال',
        },
        {
          id: 'INSTAPAY',
          name: 'إنستاباي',
          icon: '💳',
          color: 'from-blue-500 to-indigo-600',
          accountName: admin?.name || 'المدير',
          accountPhone: admin?.phone || '01000000000',
          instructions: 'حوّل المبلغ على حساب إنستاباي ده واكتب رقم العملية',
        },
        {
          id: 'ORANGE_CASH',
          name: 'أورنج كاش',
          icon: '🍊',
          color: 'from-orange-500 to-amber-600',
          accountName: admin?.name || 'المدير',
          accountPhone: admin?.phone || '01000000000',
          instructions: 'حوّل المبلغ على رقم أورنج كاش ده واكتب رقم الإيصال',
        },
      ],
      pointPrice: 1, // 1 EGP per point
    });
  } catch (error) {
    console.error('Get payment settings error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
