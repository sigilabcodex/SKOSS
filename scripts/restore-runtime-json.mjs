#!/usr/bin/env node
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

const backupArg = process.argv[2];
const restoreAllowed = process.env.SKOSS_ALLOW_JSON_RESTORE === '1';

if (!backupArg) {
  console.error('Usage: SKOSS_ALLOW_JSON_RESTORE=1 npm run skoss:restore:json -- <backup-json-path>');
  process.exit(1);
}

if (!restoreAllowed) {
  console.error('Refusing to restore without SKOSS_ALLOW_JSON_RESTORE=1.');
  console.error('This command replaces data/runtime/demo-store.json and is intended only for local rehearsal retry.');
  process.exit(1);
}

const root = process.cwd();
const runtimePath = path.join(root, 'data', 'runtime', 'demo-store.json');
const runtimeDir = path.dirname(runtimePath);
const backupDir = path.join(root, 'data', 'backups');
const sourcePath = path.resolve(root, backupArg);
const safetyBackupPath = path.join(backupDir, `pre-json-restore-${timestamp()}.json`);

let parsed;
try {
  parsed = JSON.parse(await readFile(sourcePath, 'utf8'));
} catch (error) {
  console.error(`Backup file is not readable JSON: ${sourcePath}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
  console.error(`Backup JSON must contain an object-shaped SKOSS store: ${sourcePath}`);
  process.exit(1);
}

await mkdir(runtimeDir, { recursive: true });
await mkdir(backupDir, { recursive: true });

try {
  await stat(runtimePath);
  await copyFile(runtimePath, safetyBackupPath);
  console.log(`Pre-restore safety backup created:
- ${safetyBackupPath}`);
} catch {
  console.log('No existing runtime JSON store found; skipping pre-restore safety backup.');
}

await copyFile(sourcePath, runtimePath);
console.log(`JSON runtime store restored:
- source: ${sourcePath}
- runtime: ${runtimePath}`);
