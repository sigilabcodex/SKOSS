import { readStore } from '@/lib/server/store';

export async function GET(): Promise<Response> {
  try {
    const data = await readStore();
    return Response.json({ items: data.orders });
  } catch {
    return Response.json(
      {
        error: {
          code: 'internal_error',
          message: 'Unable to load orders.',
        },
      },
      { status: 500 },
    );
  }
}
