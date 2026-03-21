import { readStore } from '@/lib/server/store';

export async function GET(): Promise<Response> {
  try {
    const data = await readStore();
    return Response.json({ items: data.shiftLogs, wipEntries: data.wipEntries });
  } catch {
    return Response.json(
      {
        error: {
          code: 'internal_error',
          message: 'Unable to load handoff data.',
        },
      },
      { status: 500 },
    );
  }
}
