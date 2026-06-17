import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth/login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ error: 'رقم التليفون والباسورد مطلوبين' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone } });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'رقم التليفون أو الباسورد غلط' }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ error: 'الحساب ده متعطل' }, { status: 403 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حصل خطأ في تسجيل الدخول' }, { status: 500 });
  }
}
