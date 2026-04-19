import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getDatabaseUrl } from '@/lib/server/db/env';
import * as schema from '@/lib/server/db/schema';

let cached:
  | {
      queryClient: postgres.Sql;
      db: ReturnType<typeof drizzle<typeof schema>>;
    }
  | undefined;

export function getPostgresDb() {
  if (cached) {
    return cached;
  }

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  const queryClient = postgres(databaseUrl, {
    max: 1,
    prepare: false,
  });

  const db = drizzle(queryClient, { schema });
  cached = { queryClient, db };
  return cached;
}
