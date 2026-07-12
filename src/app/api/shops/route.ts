import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/shops - list all shops
export async function GET() {
  try {
    const shops = await db.shop.findMany({
      include: { owner: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ shops });
  } catch (error) {
    console.error('Get shops error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// POST /api/shops - create shop (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, address, phone, ownerId } = body;

    if (!name || !type || !address || !phone || !ownerId) {
      return NextResponse.json({ error: 'كل البيانات مطلوبة' }, { status: 400 });
    }

    const owner = await db.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== 'SHOP') {
      return NextResponse.json({ error: 'صاحب المحل لازم يكون حساب شوب' }, { status: 400 });
    }

    const shop = await db.shop.create({
      data: { name, type, address, phone, ownerId },
      include: { owner: { select: { id: true, name: true, phone: true } } },
    });

    return NextResponse.json({ shop }, { status: 201 });
  } catch (error) {
    console.error('Create shop error:', error);
    return NextResponse.json({ error: 'حصل خطأ في إضافة المحل' }, { status: 500 });
  }
}
