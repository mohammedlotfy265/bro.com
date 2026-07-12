import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    await db.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`);
    return NextResponse.json({ message: 'Column added' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
