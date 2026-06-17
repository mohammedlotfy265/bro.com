import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/seed - seed initial data
export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      return NextResponse.json({ message: 'الأدمن موجود بالفعل', admin: { phone: existingAdmin.phone } });
    }

    // Create admin user (auto-approved)
    const admin = await db.user.create({
      data: {
        name: 'المدير',
        phone: '01000000000',
        password: 'admin123',
        role: 'ADMIN',
        points: 999,
        approved: true,
      },
    });

    // Create sample shop user (auto-approved)
    const shopUser = await db.user.create({
      data: {
        name: 'صيدلية النور',
        phone: '01100000000',
        password: 'shop123',
        role: 'SHOP',
        points: 0,
        approved: true,
      },
    });

    // Create sample shop
    await db.shop.create({
      data: {
        name: 'صيدلية النور',
        type: 'PHARMACY',
        address: 'شارع الجمهورية - القاهرة',
        phone: '01100000000',
        ownerId: shopUser.id,
      },
    });

    // Create sample driver (auto-approved)
    await db.user.create({
      data: {
        name: 'أحمد الدليفري',
        phone: '01200000000',
        password: 'driver123',
        role: 'DRIVER',
        points: 10,
        approved: true,
      },
    });

    return NextResponse.json({
      message: 'تم إنشاء البيانات الأولية بنجاح',
      accounts: [
        { role: 'أدمن', phone: '01000000000', password: 'admin123' },
        { role: 'شوب', phone: '01100000000', password: 'shop123' },
        { role: 'دليفري', phone: '01200000000', password: 'driver123' },
      ],
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
