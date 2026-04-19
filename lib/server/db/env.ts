export type PersistenceMode = 'json' | 'hybrid' | 'postgres';

const defaultMode: PersistenceMode = 'json';

function normalizeMode(mode: string | undefined): PersistenceMode {
  if (mode === 'hybrid' || mode === 'postgres' || mode === 'json') {
    return mode;
  }

  return defaultMode;
}

export function getPersistenceMode(): PersistenceMode {
  return normalizeMode(process.env.SKOSS_PERSISTENCE_MODE);
}

export function getDatabaseUrl(): string | undefined {
  const value = process.env.DATABASE_URL?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function isPostgresEnabled() {
  const mode = getPersistenceMode();
  return (mode === 'hybrid' || mode === 'postgres') && Boolean(getDatabaseUrl());
}
