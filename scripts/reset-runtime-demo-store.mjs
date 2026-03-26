#!/usr/bin/env node
import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const seedPath = path.join(root, 'data', 'seeds', 'demo-store.seed.json');
const runtimePath = path.join(root, 'data', 'runtime', 'demo-store.json');

await mkdir(path.dirname(runtimePath), { recursive: true });
await rm(runtimePath, { force: true });
await copyFile(seedPath, runtimePath);

console.log(`Runtime demo store reset from seed:\n- seed: ${seedPath}\n- runtime: ${runtimePath}`);
