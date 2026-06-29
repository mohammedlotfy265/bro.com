import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/points - get points transactions for user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId مطلوب' }, { status: 400 });
    }

    const transactions = await db.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    return NextResponse.json({ transactions, currentPoints: user?.points || 0 });
  } catch (error) {
    console.error('Get points error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// POST /api/points - purchase points
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amount } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'البيانات مطلوبة' }, { status: 400 });
    }

    // Add points to user
    const user = await db.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    });

    // Record transaction
    await db.pointsTransaction.create({
      data: {
        userId,
        amount,
        type: 'PURCHASE',
        description: `شراء ${amount} نقطة`,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Purchase points error:', error);
    return NextResponse.json({ error: 'حصل خطأ في شراء النقاط' }, { status: 500 });
  }
}
