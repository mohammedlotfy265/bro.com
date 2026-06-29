import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Default payment methods (used to seed DB on first call)
const DEFAULT_METHODS = [
  {
    id: 'VODAFONE_CASH',
    name: 'فودافون كاش',
    icon: '📱',
    color: 'from-red-500 to-red-600',
    instructions: 'حوّل المبلغ على رقم فودافون كاش ده واكتب رقم الإيصال',
  },
  {
    id: 'INSTAPAY',
    name: 'إنستاباي',
    icon: '💳',
    color: 'from-blue-500 to-indigo-600',
    instructions: 'حوّل المبلغ على حساب إنستاباي ده واكتب رقم العملية',
  },
  {
    id: 'ORANGE_CASH',
    name: 'أورنج كاش',
    icon: '🍊',
    color: 'from-orange-500 to-amber-600',
    instructions: 'حوّل المبلغ على رقم أورنج كاش ده واكتب رقم الإيصال',
  },
];

// Ensure payment method settings exist in DB (seed if empty)
async function ensurePaymentMethods() {
  let methods = await db.paymentMethodSetting.findMany();
  if (methods.length === 0) {
    // Get admin's name and phone as default
    const admin = await db.user.findFirst({ where: { role: 'ADMIN' } });
    const defaultName = admin?.name || 'المدير';
    const defaultPhone = admin?.phone || '01000000000';

    await db.paymentMethodSetting.createMany({
      data: DEFAULT_METHODS.map((m) => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
        color: m.color,
        accountName: defaultName,
        accountPhone: defaultPhone,
        instructions: m.instructions,
      })),
    });
    methods = await db.paymentMethodSetting.findMany();
  }
  return methods;
}

// Ensure app settings exist
async function ensureAppSettings() {
  let setting = await db.appSetting.findUnique({ where: { id: 'main' } });
  if (!setting) {
    setting = await db.appSetting.create({ data: { id: 'main', pointPrice: 1 } });
  }
  return setting;
}

// GET /api/settings/payment-methods - get payment info (public)
export async function GET() {
  try {
    const methods = await ensurePaymentMethods();
    const settings = await ensureAppSettings();

    return NextResponse.json({
      paymentMethods: methods.map((m) => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
        color: m.color,
        accountName: m.accountName,
        accountPhone: m.accountPhone,
        instructions: m.instructions,
        active: m.active,
      })),
      pointPrice: settings.pointPrice,
    });
  } catch (error) {
    console.error('Get payment settings error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// PUT /api/settings/payment-methods - admin updates payment methods
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { paymentMethods, pointPrice } = body;

    // Update each payment method
    if (Array.isArray(paymentMethods)) {
      for (const m of paymentMethods) {
        const existing = await db.paymentMethodSetting.findUnique({ where: { id: m.id } });
        if (existing) {
          await db.paymentMethodSetting.update({
            where: { id: m.id },
            data: {
              accountName: m.accountName,
              accountPhone: m.accountPhone,
              instructions: m.instructions,
              active: m.active !== false,
            },
          });
        }
      }
    }

    // Update point price
    if (typeof pointPrice === 'number' && pointPrice > 0) {
      await db.appSetting.upsert({
        where: { id: 'main' },
        update: { pointPrice },
        create: { id: 'main', pointPrice },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update payment settings error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
