import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth/register
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, password, role, address } = body;

    if (!name || !phone || !password || !role) {
      return NextResponse.json({ error: 'كل البيانات مطلوبة' }, { status: 400 });
    }

    if (role === 'SHOP' && !address) {
      return NextResponse.json({ error: 'عنوان المحل مطلوب' }, { status: 400 });
    }

    if (!['SHOP', 'DRIVER'].includes(role)) {
      return NextResponse.json({ error: 'النوع لازم يكون SHOP أو DRIVER' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({ error: 'رقم التليفون ده مسجل قبل كده' }, { status: 409 });
    }

    const user = await db.user.create({
      data: { name, phone, password, role, points: role === 'DRIVER' ? 5 : 0, approved: false, address: address || null },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'تم التسجيل بنجاح! حسابك في انتظار موافقة الأدمن. هتقدر تدخل لما الأدمن يعتمد حسابك.',
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'حصل خطأ في التسجيل' }, { status: 500 });
  }
}
