import type { AppData } from '@/lib/domain/types';
import { JsonRuntimePersistenceGateway } from '@/lib/server/persistence/json-runtime-adapter';

const gateway = new JsonRuntimePersistenceGateway();

export function getPersistenceGateway() {
  return gateway;
}

export async function readPersistence() {
  return gateway.read();
}

export async function readAppData(): Promise<AppData> {
  const context = await readPersistence();
  return context.raw;
}

export async function readSeedAppData(): Promise<AppData> {
  return gateway.readSeed();
}

export async function reseedRuntimeAppData() {
  await gateway.reseedRuntime();
}

export async function mutateAppData(next: AppData | ((data: AppData) => Promise<void> | void)) {
  await gateway.write(async ({ raw }) => {
    if (typeof next === 'function') {
      await next(raw);
      return;
    }

    Object.assign(raw, next);
  });
}
