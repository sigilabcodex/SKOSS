import { NextResponse } from 'next/server';
import { orders } from '@/data/demo-fixtures';

export function GET() {
  return NextResponse.json({ items: orders });
}
