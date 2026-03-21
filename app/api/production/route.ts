import { NextResponse } from 'next/server';
import { getProductionDayView } from '@/lib/server/demo-data';

export function GET() {
  return NextResponse.json(getProductionDayView('2026-03-28'));
}
