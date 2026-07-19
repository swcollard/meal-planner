/**
 * One-time migration: copy the flat-file `data/plans` and `data/journal`
 * JSON documents into baerly-storage. Idempotency is NOT guaranteed — each
 * run inserts fresh rows, so run it exactly once against an empty store.
 *
 *   node scripts/migrate-to-baerly.mjs
 *
 * Plain ESM (not TypeScript) so it runs under `node` directly — this machine
 * (macOS 11) can't run the esbuild binary that `tsx` depends on. It mirrors
 * the Db wiring in lib/db.ts; keep the two in sync.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Db } from '@gusto/baerly-storage';
import { localFsStorage } from '@gusto/baerly-storage/node';

const DATA_DIR = path.join(process.cwd(), 'data');

const db = Db.create({
  storage: localFsStorage(), // honors BAERLY_DATA_DIR, defaults to ./.baerly-data
  app: 'meal-planner',
  tenant: 'main',
});

function readJsonDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')));
}

const plans = readJsonDir(path.join(DATA_DIR, 'plans'));
for (const plan of plans) {
  await db.collection('plans').insert(plan);
}
console.log(`Migrated ${plans.length} plan(s).`);

const journals = readJsonDir(path.join(DATA_DIR, 'journal'));
for (const journal of journals) {
  await db.collection('journal').insert(journal);
}
console.log(`Migrated ${journals.length} journal(s).`);
