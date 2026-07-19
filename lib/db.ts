import { Db } from '@gusto/baerly-storage';
import { localFsStorage } from '@gusto/baerly-storage/node';

let cached: ReturnType<typeof Db.create> | null = null;

export function getDb() {
  if (!cached) {
    cached = Db.create({
      storage: localFsStorage(), // honors BAERLY_DATA_DIR, defaults to ./.baerly-data
      app: 'meal-planner',
      tenant: 'main',
    });
  }
  return cached;
}

// Test-only: drop the cached Db so a fresh temp-dir binding can be created.
export function resetDbForTests() {
  cached = null;
}
