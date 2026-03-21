import { NextResponse } from 'next/server';
import { shiftLogs } from '@/data/demo-fixtures';

export function GET() {
  return NextResponse.json({ items: shiftLogs });
}
