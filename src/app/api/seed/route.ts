import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DROP_TABLES = `
DROP TABLE IF EXISTS "delivery_offers";
DROP TABLE IF EXISTS "points_transactions";
DROP TABLE IF EXISTS "earnings";
DROP TABLE IF EXISTS "payment_requests";
DROP TABLE IF EXISTS "orders";
DROP TABLE IF EXISTS "payment_method_settings";
DROP TABLE IF EXISTS "app_settings";
DROP TABLE IF EXISTS "shops";
DROP TABLE IF EXISTS "users";
`;

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
    "ownerId" TEXT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "orders" (
    id TEXT PRIMARY KEY,
    "shopId" TEXT NOT NULL REFERENCES shops(id),
    description TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    commission REAL NOT NULL DEFAULT 0,
    "pointsCost" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL REFERENCES users(id),
    "acceptedDriverId" TEXT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "earnings" (
    id TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL UNIQUE REFERENCES orders(id),
    "shopId" TEXT NOT NULL REFERENCES shops(id),
    "deliveryFee" REAL NOT NULL,
    commission REAL NOT NULL,
    "driverEarning" REAL NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "delivery_offers" (
    id TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES orders(id),
    "driverId" TEXT NOT NULL REFERENCES users(id),
    price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "points_transactions" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "payment_requests" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "senderPhone" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "receiptNumber" TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "payment_method_settings" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📱',
    color TEXT NOT NULL DEFAULT 'from-red-500 to-red-600',
    "accountName" TEXT NOT NULL DEFAULT 'المدير',
    "accountPhone" TEXT NOT NULL DEFAULT '01229893053',
    instructions TEXT NOT NULL DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "app_settings" (
    id TEXT PRIMARY KEY,
    "pointPrice" REAL NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "notifications" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    "relatedId" TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

export async function POST() {
  try {
    for (const sql of [DROP_TABLES, CREATE_TABLES]) {
      for (const stmt of sql.split(';').filter(s => s.trim())) {
        await db.$executeRawUnsafe(stmt + ';');
      }
    }

    const adminPassword = 'Br0@dm!n#2024$ecure';

    const existingAdmin = await db.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      await db.user.update({
        where: { id: existingAdmin.id },
        data: { phone: '01229893053', password: adminPassword },
      });
      return NextResponse.json({ message: 'تم تحديث بيانات الأدمن', admin: { phone: '01229893053' } });
    }
    const admin = await db.user.create({
      data: {
        name: 'المدير',
        phone: '01229893053',
        password: adminPassword,
        role: 'ADMIN',
        points: 999,
        approved: true,
      },
    });

    const existingMethods = await db.paymentMethodSetting.count();
    if (existingMethods === 0) {
      const defaults = [
        { id: 'VODAFONE_CASH', name: 'فودافون كاش', icon: '📱', color: 'from-red-500 to-red-600', accountName: 'المدير', accountPhone: '01229893053', instructions: 'حوّل المبلغ على رقم فودافون كاش ده واكتب رقم الإيصال' },
        { id: 'INSTAPAY', name: 'إنستاباي', icon: '💳', color: 'from-purple-500 to-indigo-600', accountName: 'المدير', accountPhone: '01229893053', instructions: 'حوّل المبلغ على حساب إنستاباي ده واكتب رقم العملية' },
        { id: 'ORANGE_CASH', name: 'أورنج كاش', icon: '🍊', color: 'from-orange-500 to-amber-600', accountName: 'المدير', accountPhone: '01229893053', instructions: 'حوّل المبلغ على رقم أورنج كاش ده واكتب رقم الإيصال' },
      ];
      for (const d of defaults) {
        await db.paymentMethodSetting.create({ data: d });
      }
      await db.appSetting.upsert({ where: { id: 'main' }, update: { pointPrice: 1 }, create: { id: 'main', pointPrice: 1 } });
    }

    return NextResponse.json({
      message: 'تم تهيئة قاعدة البيانات بنجاح',
      accounts: [
        { role: 'أدمن', phone: '01229893053' },
      ],
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'حصل خطأ: ' + (error?.message || '') }, { status: 500 });
  }
}
