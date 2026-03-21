import { getProductionBoard } from '@/lib/server/demo-data';

export async function GET(): Promise<Response> {
  try {
    return Response.json(await getProductionBoard());
  } catch {
    return Response.json(
      {
        error: {
          code: 'internal_error',
          message: 'Unable to load production board.',
        },
      },
      { status: 500 },
    );
  }
}
