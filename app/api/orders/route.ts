import { readPersistence } from '@/lib/server/persistence';

export async function GET(): Promise<Response> {
  try {
    const context = await readPersistence();
    return Response.json({ items: context.orders.list() });
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
