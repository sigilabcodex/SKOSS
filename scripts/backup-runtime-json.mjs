#!/usr/bin/env node
import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

const root = process.cwd();
const runtimePath = path.join(root, 'data', 'runtime', 'demo-store.json');
const backupDir = path.join(root, 'data', 'backups');
const backupPath = path.join(backupDir, `skoss-json-runtime-${timestamp()}.json`);

try {
  await stat(runtimePath);
} catch {
  console.error(`Runtime JSON store not found: ${runtimePath}`);
  console.error('Start the app once or run bootstrap/reset before taking a JSON rehearsal backup.');
  process.exit(1);
}

await mkdir(backupDir, { recursive: true });
await copyFile(runtimePath, backupPath);

console.log(`JSON runtime backup created:
- source: ${runtimePath}
- backup: ${backupPath}`);
