import fs from 'fs';
import os from 'os';
import path from 'path';
import { savePlan, getPlan, listPlans, saveJournal, getJournal } from './storage';
import { resetDbForTests } from './db';
import type { Plan, Journal } from './types';

let tmpDir: string;

const mockPlan: Plan = {
  id: 'test-uuid-1234',
  weekOf: '2026-04-07',
  theme: 'Tex-Mex',
  createdAt: '2026-04-04T14:00:00Z',
  formInputs: {
    weekOf: '2026-04-07',
    theme: 'Tex-Mex',
    avoid: '',
    feature: '',
    easyCleanupDays: ['Wednesday'],
    easyLunchDay: 'Tuesday',
    notes: '',
  },
  sales: [{ item: 'Chicken thighs', price: '$1.29/lb' }],
  seasonal: ['Strawberries'],
  cookingProjects: [{ name: 'Carnitas', description: 'Low and slow pork shoulder.' }],
  breakfast: [{ name: 'Breakfast burritos', description: 'Batch-made.' }],
  meals: [
    {
      day: 'Sunday',
      lunch: { name: 'Tacos', flags: [] },
      dinner: { name: 'Carnitas', flags: [] },
    },
  ],
  groceryList: {
    'Meat & Seafood': [{ item: 'Chicken thighs', onSale: true }],
    Produce: [{ item: 'Limes', onSale: false }],
    'Dairy & Eggs': [{ item: 'Cotija', onSale: false }],
    'Pantry & Dry Goods': [{ item: 'Tortillas', onSale: false }],
  },
};

const mockJournal: Omit<Journal, 'id'> = {
  planId: 'test-uuid-1234',
  weekOf: '2026-04-07',
  entries: [{ day: 'Sunday', note: 'Carnitas were incredible.' }],
};

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'meal-planner-test-'));
  process.env.BAERLY_DATA_DIR = tmpDir;
  resetDbForTests();
});

afterEach(() => {
  delete process.env.BAERLY_DATA_DIR;
  resetDbForTests();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('savePlan / getPlan', () => {
  it('saves a plan and retrieves it by id', async () => {
    await savePlan(mockPlan);
    const retrieved = await getPlan(mockPlan.id);
    expect(retrieved).toEqual(mockPlan);
  });

  it('returns null for a non-existent plan id', async () => {
    const result = await getPlan('does-not-exist');
    expect(result).toBeNull();
  });
});

describe('listPlans', () => {
  it('returns plans sorted newest first', async () => {
    const plan1 = {
      ...mockPlan,
      id: 'plan-1',
      createdAt: '2026-04-04T10:00:00Z',
      weekOf: '2026-04-07',
    };
    const plan2 = {
      ...mockPlan,
      id: 'plan-2',
      createdAt: '2026-04-11T10:00:00Z',
      weekOf: '2026-04-14',
    };
    await savePlan(plan1);
    await savePlan(plan2);
    const plans = await listPlans();
    expect(plans[0].id).toBe('plan-2');
    expect(plans[1].id).toBe('plan-1');
  });

  it('returns empty array when no plans exist', async () => {
    const plans = await listPlans();
    expect(plans).toEqual([]);
  });
});

describe('saveJournal / getJournal', () => {
  it('creates a new journal and retrieves it by planId', async () => {
    await saveJournal(mockJournal);
    const retrieved = await getJournal(mockJournal.planId);
    expect(retrieved?.planId).toBe(mockJournal.planId);
    expect(retrieved?.entries).toEqual(mockJournal.entries);
  });

  it('updates an existing journal for the same planId', async () => {
    await saveJournal(mockJournal);
    const updatedJournal = {
      ...mockJournal,
      entries: [
        { day: 'Sunday', note: 'Carnitas were incredible.' },
        { day: 'Monday', note: 'Leftovers were great too.' },
      ],
    };
    await saveJournal(updatedJournal);
    const retrieved = await getJournal(mockJournal.planId);
    expect(retrieved?.entries).toHaveLength(2);
  });

  it('returns null for a plan with no journal', async () => {
    const result = await getJournal('no-journal-here');
    expect(result).toBeNull();
  });
});
