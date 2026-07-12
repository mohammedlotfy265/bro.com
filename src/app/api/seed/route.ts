import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS "users" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'DRIVER',
    points INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "shops" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'OTHER',
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    owner_id TEXT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "orders" (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id),
    description TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    delivery_fee REAL NOT NULL DEFAULT 0,
    commission REAL NOT NULL DEFAULT 0,
    points_cost INTEGER NOT NULL DEFAULT 1,
    created_by_id TEXT NOT NULL REFERENCES users(id),
    accepted_driver_id TEXT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "earnings" (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE REFERENCES orders(id),
    shop_id TEXT NOT NULL REFERENCES shops(id),
    delivery_fee REAL NOT NULL,
    commission REAL NOT NULL,
    driver_earning REAL NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "delivery_offers" (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    driver_id TEXT NOT NULL REFERENCES users(id),
    price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "points_transactions" (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "payment_requests" (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    receipt_number TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    admin_note TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "payment_method_settings" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📱',
    color TEXT NOT NULL DEFAULT 'from-red-500 to-red-600',
    account_name TEXT NOT NULL DEFAULT 'المدير',
    account_phone TEXT NOT NULL DEFAULT '01000000000',
    instructions TEXT NOT NULL DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "app_settings" (
    id TEXT PRIMARY KEY,
    point_price REAL NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

export async function POST() {
  try {
    await db.$executeRawUnsafe(CREATE_TABLES);

    const existingAdmin = await db.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      return NextResponse.json({ message: 'الأدمن موجود بالفعل', admin: { phone: existingAdmin.phone } });
    }

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

    await db.shop.create({
      data: {
        name: 'صيدلية النور',
        type: 'PHARMACY',
        address: 'شارع الجمهورية - القاهرة',
        phone: '01100000000',
        ownerId: shopUser.id,
      },
    });

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

    const existingMethods = await db.paymentMethodSetting.count();
    if (existingMethods === 0) {
      const defaults = [
        { id: 'VODAFONE_CASH', name: 'فودافون كاش', icon: '📱', color: 'from-red-500 to-red-600', accountName: 'المدير', accountPhone: '01000000000', instructions: 'حوّل المبلغ على رقم فودافون كاش ده واكتب رقم الإيصال' },
        { id: 'INSTAPAY', name: 'إنستاباي', icon: '💳', color: 'from-purple-500 to-indigo-600', accountName: 'المدير', accountPhone: '01000000000', instructions: 'حوّل المبلغ على حساب إنستاباي ده واكتب رقم العملية' },
        { id: 'ORANGE_CASH', name: 'أورنج كاش', icon: '🍊', color: 'from-orange-500 to-amber-600', accountName: 'المدير', accountPhone: '01000000000', instructions: 'حوّل المبلغ على رقم أورنج كاش ده واكتب رقم الإيصال' },
      ];
      for (const d of defaults) {
        await db.paymentMethodSetting.create({ data: d });
      }
      await db.appSetting.upsert({ where: { id: 'main' }, update: { pointPrice: 1 }, create: { id: 'main', pointPrice: 1 } });
    }

    return NextResponse.json({
      message: 'تم إنشاء البيانات الأولية بنجاح',
      accounts: [
        { role: 'أدمن', phone: '01000000000', password: 'admin123' },
        { role: 'شوب', phone: '01100000000', password: 'shop123' },
        { role: 'دليفري', phone: '01200000000', password: 'driver123' },
      ],
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'حصل خطأ: ' + (error?.message || '') }, { status: 500 });
  }
}
