import { readPersistence } from '@/lib/server/persistence';

export async function GET(): Promise<Response> {
  try {
    const context = await readPersistence();
    return Response.json({
      items: context.production.listShiftLogs(),
      wipEntries: context.production.listWipEntries(),
    });
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
