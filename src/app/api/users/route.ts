import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users - list all users (admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const where: Record<string, unknown> = {};
    if (role) where.role = role;

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        points: true,
        active: true,
        createdAt: true,
        shops: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// POST /api/users - admin creates user (shop or driver)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, password, role, adminRole } = body;

    if (adminRole !== 'ADMIN') {
      return NextResponse.json({ error: 'مسموح للأدمن بس' }, { status: 403 });
    }

    if (!name || !phone || !password || !role) {
      return NextResponse.json({ error: 'كل البيانات مطلوبة' }, { status: 400 });
    }

    if (!['SHOP', 'DRIVER'].includes(role)) {
      return NextResponse.json({ error: 'النوع لازم يكون SHOP أو DRIVER' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({ error: 'رقم التليفون ده مسجل قبل كده' }, { status: 409 });
    }

    const user = await db.user.create({
      data: { name, phone, password, role, points: role === 'DRIVER' ? 5 : 0 },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'حصل خطأ في إنشاء المستخدم' }, { status: 500 });
  }
}

// PATCH /api/users - toggle user active status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, active, adminRole } = body;

    if (adminRole !== 'ADMIN') {
      return NextResponse.json({ error: 'مسموح للأدمن بس' }, { status: 403 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { active },
      select: { id: true, name: true, active: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Toggle user error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
