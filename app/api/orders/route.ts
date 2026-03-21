import { NextResponse } from 'next/server';
import { readStore } from '@/lib/server/store';

export async function GET() {
  const data = await readStore();
  return NextResponse.json({ items: data.orders });
}
