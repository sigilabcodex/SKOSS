import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { demoSeed } from '@/data/demo-seed';
import type { AppData } from '@/lib/domain/types';

const storePath = path.join(process.cwd(), 'data', 'demo-store.json');

async function ensureStore() {
  try {
    await readFile(storePath, 'utf8');
  } catch {
    await mkdir(path.dirname(storePath), { recursive: true });
    await writeFile(storePath, JSON.stringify(demoSeed, null, 2), 'utf8');
  }
}

export async function readStore(): Promise<AppData> {
  await ensureStore();
  const raw = await readFile(storePath, 'utf8');
  return JSON.parse(raw) as AppData;
}

export async function writeStore(data: AppData) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(data, null, 2), 'utf8');
}
