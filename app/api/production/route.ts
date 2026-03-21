import { NextResponse } from 'next/server';
import { getProductionBoard } from '@/lib/server/demo-data';

export async function GET() {
  return NextResponse.json(await getProductionBoard());
}
