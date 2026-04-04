# Meal Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-only Next.js web app that generates weekly meal plans via Claude, streams results, and stores plans + journal notes as JSON files.

**Architecture:** Next.js App Router with TypeScript and Tailwind CSS. Business logic lives in `lib/` (types, storage, prompt assembly). API routes in `app/api/` call the Anthropic SDK with streaming and save results as JSON files in `data/`. Three pages: timeline feed (`/`), new plan form (`/new`), and plan detail (`/plan/[id]`).

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, `@anthropic-ai/sdk`, Jest + ts-jest, Prettier, ESLint, Husky + lint-staged

---

## Parallelization Guide

After **Task 3** (types defined), the plan splits into two tracks:
- **Backend track**: Tasks 4 → 5 → 6 → 7 → 8
- **Frontend track**: Tasks 9 → 10 → 11 → 12 → 13 → 14

These tracks can be executed in parallel by separate agents. Both depend only on `lib/types.ts` from Task 3.

**Milestone checkpoints** (for code review after each):
- **Milestone A**: Tasks 1–3 complete (project setup + types)
- **Milestone B**: Tasks 4–5 complete (storage + prompt)
- **Milestone C**: Tasks 6–8 complete (all API routes)
- **Milestone D**: Tasks 9–11 complete (layout + plan detail components)
- **Milestone E**: Tasks 12–14 complete (all pages working end-to-end)

---

## File Map

```
/
├── app/
│   ├── layout.tsx                      # Root layout with Nav
│   ├── page.tsx                        # Timeline/history page
│   ├── globals.css                     # Tailwind base styles
│   ├── new/
│   │   └── page.tsx                    # New plan form + streaming UI
│   ├── plan/
│   │   └── [id]/
│   │       └── page.tsx                # Plan detail server component
│   └── api/
│       ├── generate/
│       │   └── route.ts                # POST: stream generation, save plan
│       ├── plans/
│       │   ├── route.ts                # GET: list all plans
│       │   └── [id]/
│       │       └── route.ts            # GET: single plan by id
│       └── journal/
│           ├── route.ts                # POST: create/update journal entry
│           └── [planId]/
│               └── route.ts            # GET: journal entries for a plan
├── lib/
│   ├── types.ts                        # All TypeScript interfaces
│   ├── storage.ts                      # Read/write plans and journal files
│   ├── storage.test.ts                 # Tests for storage operations
│   ├── prompt.ts                       # Base prompt + assemblePrompt()
│   └── prompt.test.ts                  # Tests for prompt assembly
├── components/
│   ├── Nav.tsx                         # Top navigation bar
│   ├── PlanCard.tsx                    # Card for timeline feed
│   ├── PlanDetail.tsx                  # Full plan detail layout
│   ├── MealTable.tsx                   # 7-day meal grid
│   ├── GroceryList.tsx                 # Grocery list by section
│   └── JournalSection.tsx              # Journal entries + add-note form
├── data/
│   ├── plans/                          # YYYY-MM-DD-<uuid>.json per plan
│   └── journal/                        # YYYY-MM-DD-<uuid>.json per journal
├── .env.local                          # ANTHROPIC_API_KEY (gitignored)
├── .gitignore
├── .prettierrc
├── .prettierignore
├── jest.config.ts
└── jest.setup.ts
```

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx` (scaffold), `app/page.tsx` (scaffold)

- [ ] **Step 1: Initialize the project**

From `/Users/samuel/Github/meal-planner`, run:
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

If prompted about overwriting `package.json`, confirm yes. If the `--yes` flag doesn't suppress all prompts, answer: TypeScript=Yes, ESLint=Yes, Tailwind=Yes, `src/` directory=No, App Router=Yes, import alias=Yes (keep `@/*`).

Expected: Next.js project files created. `npm run dev` starts the dev server.

- [ ] **Step 2: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

Expected: `@anthropic-ai/sdk` in `package.json` dependencies.

- [ ] **Step 3: Create data directories**

```bash
mkdir -p data/plans data/journal
```

- [ ] **Step 4: Create .env.local**

Create `/Users/samuel/Github/meal-planner/.env.local`:
```
ANTHROPIC_API_KEY=your-key-here
```

- [ ] **Step 5: Update .gitignore**

Open `.gitignore` and verify (or add) these entries:
```
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env.local

# Local data
data/

# Superpowers
.superpowers/
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

## Task 2: Configure Tooling (Prettier, Husky, Jest)

**Files:**
- Create: `.prettierrc`, `.prettierignore`, `jest.config.ts`, `jest.setup.ts`
- Modify: `package.json` (scripts + devDependencies)

- [ ] **Step 1: Install tooling dependencies**

```bash
npm install --save-dev \
  prettier \
  eslint-config-prettier \
  husky \
  lint-staged \
  jest \
  ts-jest \
  @types/jest \
  jest-environment-node
```

- [ ] **Step 2: Create `.prettierrc`**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

- [ ] **Step 3: Create `.prettierignore`**

```
.next/
node_modules/
data/
```

- [ ] **Step 4: Create `jest.config.ts`**

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/*.test.ts'],
};

export default config;
```

- [ ] **Step 5: Create `jest.setup.ts`**

```typescript
// Global test setup — empty for now
```

- [ ] **Step 6: Update `package.json` scripts and lint-staged config**

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

- [ ] **Step 7: Initialize Husky**

```bash
npx husky init
```

Edit `.husky/pre-commit`:
```bash
#!/bin/sh
npx lint-staged
```

Make it executable:
```bash
chmod +x .husky/pre-commit
```

- [ ] **Step 8: Add prettier to ESLint config**

Open `eslint.config.mjs` (or `.eslintrc.json` depending on Next.js version). If it's the flat config format (`eslint.config.mjs`), add:

```javascript
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
];

export default eslintConfig;
```

- [ ] **Step 9: Verify Jest works**

```bash
npm test -- --passWithNoTests
```

Expected: "Test Suites: 0 passed" or similar (no failures).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add Prettier, Husky, lint-staged, and Jest configuration"
```

---

## Task 3: Core TypeScript Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```typescript
// Form inputs from the /new page
export interface PlanFormInputs {
  weekOf: string; // ISO date string, e.g. "2026-04-07"
  theme: string;
  avoid: string;
  feature: string;
  easyCleanupDays: string[]; // e.g. ["Wednesday"]
  easyLunchDay: string; // e.g. "Tuesday"
  notes: string;
}

// A single meal (lunch or dinner)
export interface Meal {
  name: string;
  flags: Array<'easy-assembly' | 'one-pan'>;
}

// One day's meals
export interface DayMeals {
  day: string; // "Sunday" through "Saturday"
  lunch: Meal;
  dinner: Meal;
}

// A cooking project for the weekend
export interface CookingProject {
  name: string;
  description: string;
}

// A breakfast option
export interface BreakfastOption {
  name: string;
  description: string;
}

// A sale item
export interface SaleItem {
  item: string;
  price: string;
}

// A grocery list item
export interface GroceryItem {
  item: string;
  onSale: boolean;
}

// Grocery list organized by section
export interface GroceryList {
  'Meat & Seafood': GroceryItem[];
  'Produce': GroceryItem[];
  'Dairy & Eggs': GroceryItem[];
  'Pantry & Dry Goods': GroceryItem[];
}

// A full meal plan (stored as JSON file)
export interface Plan {
  id: string;
  weekOf: string; // ISO date string, e.g. "2026-04-07"
  theme: string;
  createdAt: string; // ISO datetime string
  formInputs: PlanFormInputs;
  sales: SaleItem[];
  seasonal: string[];
  cookingProjects: CookingProject[];
  breakfast: BreakfastOption[];
  meals: DayMeals[];
  groceryList: GroceryList;
}

// A plan summary for the timeline feed (no full meals/grocery detail)
export interface PlanSummary {
  id: string;
  weekOf: string;
  theme: string;
  createdAt: string;
  cookingProjects: CookingProject[];
  meals: DayMeals[];
}

// A single journal entry for one day
export interface JournalEntry {
  day: string;
  note: string;
}

// A journal document for a plan (stored as JSON file)
export interface Journal {
  id: string;
  planId: string;
  weekOf: string;
  entries: JournalEntry[];
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add core TypeScript types"
```

---

> **PARALLELIZATION POINT**: After Task 3 commits, the Backend Track (Tasks 4–8) and Frontend Track (Tasks 9–14) can proceed in parallel.

---

## BACKEND TRACK

### Task 4: File Storage Operations

**Files:**
- Create: `lib/storage.ts`, `lib/storage.test.ts`

- [ ] **Step 1: Write failing tests for storage operations**

Create `lib/storage.test.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import { savePlan, getPlan, listPlans, saveJournal, getJournal } from './storage';
import type { Plan, Journal } from './types';

const TEST_DATA_DIR = path.join(process.cwd(), 'data-test');

// Override DATA_DIR for tests
jest.mock('./storage', () => {
  const actual = jest.requireActual('./storage');
  return {
    ...actual,
    DATA_DIR: path.join(process.cwd(), 'data-test'),
  };
});

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
  fs.mkdirSync(path.join(TEST_DATA_DIR, 'plans'), { recursive: true });
  fs.mkdirSync(path.join(TEST_DATA_DIR, 'journal'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
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
    const plan1 = { ...mockPlan, id: 'plan-1', createdAt: '2026-04-04T10:00:00Z', weekOf: '2026-04-07' };
    const plan2 = { ...mockPlan, id: 'plan-2', createdAt: '2026-04-11T10:00:00Z', weekOf: '2026-04-14' };
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
    const journal = await saveJournal(mockJournal);
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- lib/storage.test.ts
```

Expected: FAIL — "Cannot find module './storage'"

- [ ] **Step 3: Create `lib/storage.ts`**

```typescript
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Plan, PlanSummary, Journal } from './types';

export const DATA_DIR = path.join(process.cwd(), 'data');
const PLANS_DIR = path.join(DATA_DIR, 'plans');
const JOURNAL_DIR = path.join(DATA_DIR, 'journal');

function ensureDirs() {
  fs.mkdirSync(PLANS_DIR, { recursive: true });
  fs.mkdirSync(JOURNAL_DIR, { recursive: true });
}

function planFileName(weekOf: string, id: string): string {
  return path.join(PLANS_DIR, `${weekOf}-${id}.json`);
}

function journalFileName(weekOf: string, id: string): string {
  return path.join(JOURNAL_DIR, `${weekOf}-${id}.json`);
}

export async function savePlan(plan: Plan): Promise<void> {
  ensureDirs();
  const filePath = planFileName(plan.weekOf, plan.id);
  fs.writeFileSync(filePath, JSON.stringify(plan, null, 2), 'utf-8');
}

export async function getPlan(id: string): Promise<Plan | null> {
  ensureDirs();
  const files = fs.readdirSync(PLANS_DIR);
  const file = files.find((f) => f.includes(id));
  if (!file) return null;
  const content = fs.readFileSync(path.join(PLANS_DIR, file), 'utf-8');
  return JSON.parse(content) as Plan;
}

export async function listPlans(): Promise<PlanSummary[]> {
  ensureDirs();
  const files = fs.readdirSync(PLANS_DIR);
  const plans: Plan[] = files
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const content = fs.readFileSync(path.join(PLANS_DIR, f), 'utf-8');
      return JSON.parse(content) as Plan;
    });

  return plans
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(
      ({ id, weekOf, theme, createdAt, cookingProjects, meals }): PlanSummary => ({
        id,
        weekOf,
        theme,
        createdAt,
        cookingProjects,
        meals,
      }),
    );
}

export async function saveJournal(
  input: Omit<Journal, 'id'>,
): Promise<Journal> {
  ensureDirs();
  // Check if journal already exists for this planId
  const existing = await getJournal(input.planId);

  if (existing) {
    // Update in place
    const updated: Journal = { ...existing, entries: input.entries };
    const files = fs.readdirSync(JOURNAL_DIR);
    const file = files.find((f) => f.includes(existing.id));
    if (file) {
      fs.writeFileSync(path.join(JOURNAL_DIR, file), JSON.stringify(updated, null, 2), 'utf-8');
    }
    return updated;
  }

  // Create new journal
  const journal: Journal = {
    id: randomUUID(),
    ...input,
  };
  const filePath = journalFileName(journal.weekOf, journal.id);
  fs.writeFileSync(filePath, JSON.stringify(journal, null, 2), 'utf-8');
  return journal;
}

export async function getJournal(planId: string): Promise<Journal | null> {
  ensureDirs();
  const files = fs.readdirSync(JOURNAL_DIR);
  for (const file of files) {
    const content = fs.readFileSync(path.join(JOURNAL_DIR, file), 'utf-8');
    const journal = JSON.parse(content) as Journal;
    if (journal.planId === planId) return journal;
  }
  return null;
}
```

- [ ] **Step 4: Fix the test mock (DATA_DIR is a const, not mockable directly)**

The test mocks won't work with the const approach. Update `lib/storage.test.ts` to use a different strategy — set an env var and have storage.ts read from it:

Update `lib/storage.ts` — change the `DATA_DIR` line:
```typescript
export const DATA_DIR = process.env.MEAL_PLANNER_DATA_DIR ?? path.join(process.cwd(), 'data');
```

And derive subdirs from `DATA_DIR`:
```typescript
function getPlansDir() {
  return path.join(DATA_DIR, 'plans');
}
function getJournalDir() {
  return path.join(DATA_DIR, 'journal');
}
```

Replace all `PLANS_DIR` with `getPlansDir()` and `JOURNAL_DIR` with `getJournalDir()` throughout.

Update `lib/storage.test.ts` — remove the `jest.mock` block and add to `beforeEach`:
```typescript
const TEST_DATA_DIR = path.join(process.cwd(), 'data-test');

beforeEach(() => {
  process.env.MEAL_PLANNER_DATA_DIR = TEST_DATA_DIR;
  fs.mkdirSync(path.join(TEST_DATA_DIR, 'plans'), { recursive: true });
  fs.mkdirSync(path.join(TEST_DATA_DIR, 'journal'), { recursive: true });
});

afterEach(() => {
  delete process.env.MEAL_PLANNER_DATA_DIR;
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});
```

Remove the `jest.mock('./storage', ...)` block entirely.

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test -- lib/storage.test.ts
```

Expected: All 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/storage.ts lib/storage.test.ts
git commit -m "feat: add file storage operations for plans and journal entries"
```

---

### Task 5: Prompt Assembly

**Files:**
- Create: `lib/prompt.ts`, `lib/prompt.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/prompt.test.ts`:

```typescript
import { assemblePrompt, SYSTEM_PROMPT } from './prompt';
import type { PlanFormInputs } from './types';

const baseInputs: PlanFormInputs = {
  weekOf: '2026-04-07',
  theme: '',
  avoid: '',
  feature: '',
  easyCleanupDays: ['Wednesday'],
  easyLunchDay: 'Tuesday',
  notes: '',
};

describe('SYSTEM_PROMPT', () => {
  it('mentions sesame allergy', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('sesame');
  });

  it('instructs Claude to return JSON only', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('json');
  });
});

describe('assemblePrompt', () => {
  it('includes the week-of date', () => {
    const prompt = assemblePrompt(baseInputs);
    expect(prompt).toContain('2026-04-07');
  });

  it('includes EASY CLEANUP day when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, easyCleanupDays: ['Wednesday'] });
    expect(prompt).toContain('EASY CLEANUP: Wednesday');
  });

  it('includes multiple easy cleanup days joined', () => {
    const prompt = assemblePrompt({ ...baseInputs, easyCleanupDays: ['Wednesday', 'Thursday'] });
    expect(prompt).toContain('EASY CLEANUP: Wednesday, Thursday');
  });

  it('includes EASY LUNCH day', () => {
    const prompt = assemblePrompt({ ...baseInputs, easyLunchDay: 'Tuesday' });
    expect(prompt).toContain('EASY LUNCH: Tuesday');
  });

  it('includes THEME when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, theme: 'Tex-Mex' });
    expect(prompt).toContain('THEME: Tex-Mex');
  });

  it('omits THEME line when empty', () => {
    const prompt = assemblePrompt({ ...baseInputs, theme: '' });
    expect(prompt).not.toContain('THEME:');
  });

  it('includes AVOID when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, avoid: 'beef' });
    expect(prompt).toContain('AVOID: beef');
  });

  it('omits AVOID line when empty', () => {
    const prompt = assemblePrompt({ ...baseInputs, avoid: '' });
    expect(prompt).not.toContain('AVOID:');
  });

  it('includes FEATURE when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, feature: 'zucchini' });
    expect(prompt).toContain('FEATURE: zucchini');
  });

  it('omits FEATURE line when empty', () => {
    const prompt = assemblePrompt({ ...baseInputs, feature: '' });
    expect(prompt).not.toContain('FEATURE:');
  });

  it('includes freeform notes when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, notes: 'DATE NIGHT Friday' });
    expect(prompt).toContain('DATE NIGHT Friday');
  });

  it('omits notes section when empty', () => {
    const prompt = assemblePrompt({ ...baseInputs, notes: '' });
    expect(prompt).not.toContain('Additional notes:');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- lib/prompt.test.ts
```

Expected: FAIL — "Cannot find module './prompt'"

- [ ] **Step 3: Create `lib/prompt.ts`**

```typescript
import type { PlanFormInputs } from './types';

export const SYSTEM_PROMPT = `You are a weekly meal planning assistant for a family of 3 in Texas.

You have access to web search. Use it to find:
1. This week's HEB weekly grocery ad (search "HEB weekly ad [current month year]")
2. What produce is currently in season in Texas (search "Texas produce in season [current month]")

CRITICAL CONSTRAINT — SEVERE SESAME ALLERGY: Never include sesame seeds, sesame oil, tahini, sesame paste, hummus (often contains tahini), or any product that may contain sesame. This is a life-threatening allergy. Double-check every ingredient and dish name.

Your response must be ONLY a valid JSON object — no markdown formatting, no code blocks, no explanation text before or after. The JSON must exactly match this schema:

{
  "sales": [{ "item": string, "price": string }],
  "seasonal": [string],
  "cookingProjects": [{ "name": string, "description": string }],
  "breakfast": [{ "name": string, "description": string }],
  "meals": [
    {
      "day": "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday",
      "lunch": { "name": string, "flags": ("easy-assembly" | "one-pan")[] },
      "dinner": { "name": string, "flags": ("easy-assembly" | "one-pan")[] }
    }
  ],
  "groceryList": {
    "Meat & Seafood": [{ "item": string, "onSale": boolean }],
    "Produce": [{ "item": string, "onSale": boolean }],
    "Dairy & Eggs": [{ "item": string, "onSale": boolean }],
    "Pantry & Dry Goods": [{ "item": string, "onSale": boolean }]
  }
}

All 7 days (Sunday through Saturday) must be included in "meals". Sale items in groceryList should have "onSale": true.`;

export function assemblePrompt(inputs: PlanFormInputs): string {
  const overrides: string[] = [];

  if (inputs.theme) overrides.push(`THEME: ${inputs.theme}`);
  if (inputs.avoid) overrides.push(`AVOID: ${inputs.avoid}`);
  if (inputs.feature) overrides.push(`FEATURE: ${inputs.feature}`);
  if (inputs.easyCleanupDays.length > 0) {
    overrides.push(`EASY CLEANUP: ${inputs.easyCleanupDays.join(', ')}`);
  }
  if (inputs.easyLunchDay) overrides.push(`EASY LUNCH: ${inputs.easyLunchDay}`);

  let prompt = `Generate a complete weekly meal plan for the week of ${inputs.weekOf}.`;

  if (overrides.length > 0) {
    prompt += `\n\nOverrides for this week:\n${overrides.join('\n')}`;
  }

  if (inputs.notes.trim()) {
    prompt += `\n\nAdditional notes: ${inputs.notes.trim()}`;
  }

  return prompt;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- lib/prompt.test.ts
```

Expected: All 13 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/prompt.ts lib/prompt.test.ts
git commit -m "feat: add prompt assembly with system prompt and override builder"
```

---

### Task 6: Generate API Route (Streaming)

**Files:**
- Create: `app/api/generate/route.ts`

- [ ] **Step 1: Create `app/api/generate/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import { assemblePrompt, SYSTEM_PROMPT } from '@/lib/prompt';
import { savePlan } from '@/lib/storage';
import type { Plan, PlanFormInputs } from '@/lib/types';

const DONE_TOKEN = '__PLAN_SAVED__';

function parsePlanResponse(jsonText: string, inputs: PlanFormInputs): Plan {
  // Strip markdown code fences if Claude wrapped the JSON anyway
  const cleaned = jsonText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    id: randomUUID(),
    weekOf: inputs.weekOf,
    theme: inputs.theme || 'Weekly Plan',
    createdAt: new Date().toISOString(),
    formInputs: inputs,
    sales: parsed.sales ?? [],
    seasonal: parsed.seasonal ?? [],
    cookingProjects: parsed.cookingProjects ?? [],
    breakfast: parsed.breakfast ?? [],
    meals: parsed.meals ?? [],
    groceryList: parsed.groceryList ?? {
      'Meat & Seafood': [],
      Produce: [],
      'Dairy & Eggs': [],
      'Pantry & Dry Goods': [],
    },
  };
}

export async function POST(request: NextRequest) {
  const inputs = (await request.json()) as PlanFormInputs;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not set. Add it to .env.local.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const anthropic = new Anthropic({ apiKey });
  const userPrompt = assemblePrompt(inputs);

  const encoder = new TextEncoder();
  let fullText = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: 'claude-opus-4-6',
          max_tokens: 8096,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
          tools: [{ type: 'web_search_20250305', name: 'web_search' } as Parameters<typeof anthropic.messages.stream>[0]['tools'][0]],
        });

        for await (const chunk of messageStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            fullText += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        // Parse and save the complete plan
        let planId: string;
        try {
          const plan = parsePlanResponse(fullText, inputs);
          await savePlan(plan);
          planId = plan.id;
        } catch {
          controller.enqueue(encoder.encode(`\n${DONE_TOKEN}:ERROR`));
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(`\n${DONE_TOKEN}:${planId}`));
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`\n${DONE_TOKEN}:ERROR:${message}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/generate/route.ts
git commit -m "feat: add streaming generate API route with Claude integration"
```

---

### Task 7: Plans API Routes

**Files:**
- Create: `app/api/plans/route.ts`, `app/api/plans/[id]/route.ts`

- [ ] **Step 1: Create `app/api/plans/route.ts`**

```typescript
import { listPlans } from '@/lib/storage';

export async function GET() {
  try {
    const plans = await listPlans();
    return Response.json(plans);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list plans';
    return Response.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `app/api/plans/[id]/route.ts`**

```typescript
import { getPlan } from '@/lib/storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const plan = await getPlan(id);
    if (!plan) return Response.json({ error: 'Plan not found' }, { status: 404 });
    return Response.json(plan);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get plan';
    return Response.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/plans/
git commit -m "feat: add plans list and detail API routes"
```

---

### Task 8: Journal API Routes

**Files:**
- Create: `app/api/journal/route.ts`, `app/api/journal/[planId]/route.ts`

- [ ] **Step 1: Create `app/api/journal/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { saveJournal } from '@/lib/storage';
import type { JournalEntry } from '@/lib/types';

interface JournalPostBody {
  planId: string;
  weekOf: string;
  entries: JournalEntry[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as JournalPostBody;
    const journal = await saveJournal({
      planId: body.planId,
      weekOf: body.weekOf,
      entries: body.entries,
    });
    return Response.json(journal);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save journal';
    return Response.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `app/api/journal/[planId]/route.ts`**

```typescript
import { getJournal } from '@/lib/storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const { planId } = await params;
  try {
    const journal = await getJournal(planId);
    if (!journal) return Response.json({ entries: [] });
    return Response.json(journal);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get journal';
    return Response.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/journal/
git commit -m "feat: add journal create/update and retrieval API routes"
```

---

## FRONTEND TRACK

### Task 9: Root Layout and Navigation

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `components/Nav.tsx`

- [ ] **Step 1: Create `components/Nav.tsx`**

```tsx
import Link from 'next/link';

export function Nav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700">
          🍽 Meal Planner
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            History
          </Link>
          <Link
            href="/new"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            + New Plan
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Nav } from '@/components/Nav';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meal Planner',
  description: 'Weekly meal plans for the family',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 antialiased`}>
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Nav.tsx app/layout.tsx
git commit -m "feat: add root layout with top navigation bar"
```

---

### Task 10: New Plan Form

**Files:**
- Modify: `app/new/page.tsx`

- [ ] **Step 1: Create `app/new/page.tsx`**

This is a client component because it has interactivity and streams the response.

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlanFormInputs } from '@/lib/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function nextMonday(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun, 1 = Mon
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toISOString().split('T')[0];
}

const DONE_TOKEN = '__PLAN_SAVED__';

export default function NewPlanPage() {
  const router = useRouter();
  const [form, setForm] = useState<PlanFormInputs>({
    weekOf: nextMonday(),
    theme: '',
    avoid: '',
    feature: '',
    easyCleanupDays: ['Wednesday'],
    easyLunchDay: 'Tuesday',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'generating' | 'error'>('idle');
  const [streamText, setStreamText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function handleCleanupDayToggle(day: string) {
    setForm((prev) => ({
      ...prev,
      easyCleanupDays: prev.easyCleanupDays.includes(day)
        ? prev.easyCleanupDays.filter((d) => d !== day)
        : [...prev.easyCleanupDays, day],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('generating');
    setStreamText('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamText(accumulated);

        // Check for done token
        if (accumulated.includes(DONE_TOKEN)) {
          const tokenLine = accumulated
            .split('\n')
            .find((l) => l.includes(DONE_TOKEN));
          if (tokenLine) {
            const parts = tokenLine.split(':');
            const planId = parts[1];
            if (planId && planId !== 'ERROR') {
              router.push(`/plan/${planId}`);
              return;
            } else {
              const errorDetail = parts.slice(2).join(':') || 'Failed to parse response';
              setErrorMessage(`Generation failed: ${errorDetail}`);
              setStatus('error');
              return;
            }
          }
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  }

  if (status === 'generating') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Generating your meal plan…</h1>
        <p className="text-sm text-gray-500">
          Claude is searching for HEB sales and seasonal produce. This takes about 30–60 seconds.
        </p>
        <div className="animate-pulse text-sm font-mono text-gray-400">
          {streamText
            ? `${streamText.slice(0, 200)}${streamText.length > 200 ? '…' : ''}`
            : 'Starting…'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Meal Plan</h1>

      {status === 'error' && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!process.env.NEXT_PUBLIC_HAS_API_KEY && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Add your <code>ANTHROPIC_API_KEY</code> to <code>.env.local</code> to generate plans.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Week of */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Week of</label>
          <input
            type="date"
            value={form.weekOf}
            onChange={(e) => setForm((p) => ({ ...p, weekOf: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Theme</label>
          <input
            type="text"
            placeholder="e.g. Tex-Mex, Mediterranean, Comfort food"
            value={form.theme}
            onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Avoid */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Avoid</label>
          <input
            type="text"
            placeholder="e.g. beef, spicy food, pasta"
            value={form.avoid}
            onChange={(e) => setForm((p) => ({ ...p, avoid: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Feature */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Feature ingredient</label>
          <input
            type="text"
            placeholder="e.g. zucchini, leftover rotisserie chicken"
            value={form.feature}
            onChange={(e) => setForm((p) => ({ ...p, feature: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Easy cleanup days */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Easy cleanup days</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleCleanupDayToggle(day)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  form.easyCleanupDays.includes(day)
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Easy lunch day */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Easy lunch day</label>
          <select
            value={form.easyLunchDay}
            onChange={(e) => setForm((p) => ({ ...p, easyLunchDay: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Additional notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Additional notes</label>
          <textarea
            rows={3}
            placeholder="e.g. DATE NIGHT Friday, GUESTS Saturday, BUDGET FOCUS this week"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Generate Meal Plan
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/new/page.tsx
git commit -m "feat: add new plan form with streaming generation UI"
```

---

### Task 11: Plan Detail Components

**Files:**
- Create: `components/MealTable.tsx`, `components/GroceryList.tsx`, `components/PlanDetail.tsx`

- [ ] **Step 1: Create `components/MealTable.tsx`**

```tsx
import type { DayMeals } from '@/lib/types';

const FLAG_LABELS: Record<string, string> = {
  'easy-assembly': '⚡ EASY ASSEMBLY',
  'one-pan': '🍳 ONE PAN',
};

function MealCell({ meal }: { meal: DayMeals['lunch'] }) {
  return (
    <div>
      <p className="text-sm text-gray-900">{meal.name}</p>
      {meal.flags.map((flag) => (
        <span
          key={flag}
          className="mt-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800"
        >
          {FLAG_LABELS[flag] ?? flag}
        </span>
      ))}
    </div>
  );
}

export function MealTable({ meals }: { meals: DayMeals[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
              Day
            </th>
            <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Lunch
            </th>
            <th className="py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Dinner
            </th>
          </tr>
        </thead>
        <tbody>
          {meals.map((day) => (
            <tr key={day.day} className="border-b border-gray-100">
              <td className="py-3 pr-4 text-sm font-medium text-gray-700">{day.day}</td>
              <td className="py-3 pr-4">
                <MealCell meal={day.lunch} />
              </td>
              <td className="py-3">
                <MealCell meal={day.dinner} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/GroceryList.tsx`**

```tsx
import type { GroceryList as GroceryListType } from '@/lib/types';

const SECTIONS = [
  'Meat & Seafood',
  'Produce',
  'Dairy & Eggs',
  'Pantry & Dry Goods',
] as const;

export function GroceryList({ groceryList }: { groceryList: GroceryListType }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {SECTIONS.map((section) => {
        const items = groceryList[section] ?? [];
        if (items.length === 0) return null;
        return (
          <div key={section}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {section}
            </h3>
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  {item.onSale && (
                    <span className="text-xs font-bold text-red-600">SALE</span>
                  )}
                  <span className={item.onSale ? 'text-red-700 font-medium' : ''}>
                    {item.item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create `components/PlanDetail.tsx`**

```tsx
import type { Plan } from '@/lib/types';
import { MealTable } from './MealTable';
import { GroceryList } from './GroceryList';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export function PlanDetail({ plan }: { plan: Plan }) {
  const weekLabel = new Date(plan.weekOf + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500">Week of {weekLabel}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          {plan.theme || 'Weekly Meal Plan'}
        </h1>
      </div>

      {/* HEB Sales */}
      {plan.sales.length > 0 && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="mb-3 text-base font-semibold text-red-800">🛒 HEB Sales This Week</h2>
          <ul className="space-y-1">
            {plan.sales.map((s, i) => (
              <li key={i} className="flex items-baseline justify-between text-sm">
                <span className="text-red-900">{s.item}</span>
                <span className="ml-4 font-mono text-red-700">{s.price}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* In Season */}
      {plan.seasonal.length > 0 && (
        <section className="rounded-lg border border-green-200 bg-green-50 p-5">
          <h2 className="mb-3 text-base font-semibold text-green-800">🌿 In Season in Texas</h2>
          <div className="flex flex-wrap gap-2">
            {plan.seasonal.map((item, i) => (
              <span
                key={i}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Weekend Cooking Projects */}
      {plan.cookingProjects.length > 0 && (
        <Section title="🥘 Weekend Cooking Projects">
          <ol className="space-y-3">
            {plan.cookingProjects.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 text-sm font-bold text-gray-400">{i + 1}.</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Breakfast */}
      {plan.breakfast.length > 0 && (
        <Section title="☀️ Breakfast Options">
          <ul className="space-y-2">
            {plan.breakfast.map((b, i) => (
              <li key={i}>
                <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                {b.description && (
                  <p className="text-sm text-gray-600">{b.description}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Meal Table */}
      {plan.meals.length > 0 && (
        <Section title="📅 Meal Schedule">
          <MealTable meals={plan.meals} />
        </Section>
      )}

      {/* Grocery List */}
      {plan.groceryList && (
        <Section title="🛍 Grocery List">
          <GroceryList groceryList={plan.groceryList} />
        </Section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/MealTable.tsx components/GroceryList.tsx components/PlanDetail.tsx
git commit -m "feat: add plan detail components (meal table, grocery list, plan layout)"
```

---

### Task 12: Plan Detail Page

**Files:**
- Create: `app/plan/[id]/page.tsx`

- [ ] **Step 1: Create `app/plan/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { getPlan, getJournal } from '@/lib/storage';
import { PlanDetail } from '@/components/PlanDetail';
import { JournalSection } from '@/components/JournalSection';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlanPage({ params }: Props) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) notFound();

  const journal = await getJournal(id);

  return (
    <div className="space-y-8">
      <PlanDetail plan={plan} />
      <JournalSection
        planId={plan.id}
        weekOf={plan.weekOf}
        initialEntries={journal?.entries ?? []}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/plan/
git commit -m "feat: add plan detail server page"
```

---

### Task 13: Journal Section Component

**Files:**
- Create: `components/JournalSection.tsx`

This is a client component — it needs interactivity to add/edit notes.

- [ ] **Step 1: Create `components/JournalSection.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { JournalEntry } from '@/lib/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  planId: string;
  weekOf: string;
  initialEntries: JournalEntry[];
}

export function JournalSection({ planId, weekOf, initialEntries }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');
  const [saving, setSaving] = useState(false);

  function getEntry(day: string) {
    return entries.find((e) => e.day === day);
  }

  function startEdit(day: string) {
    setEditingDay(day);
    setDraftNote(getEntry(day)?.note ?? '');
  }

  async function saveEntry(day: string) {
    setSaving(true);
    const updatedEntries = entries.filter((e) => e.day !== day);
    if (draftNote.trim()) {
      updatedEntries.push({ day, note: draftNote.trim() });
    }

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, weekOf, entries: updatedEntries }),
      });
      if (res.ok) {
        setEntries(updatedEntries);
      }
    } finally {
      setSaving(false);
      setEditingDay(null);
      setDraftNote('');
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-900">📓 Cooking Journal</h2>
      <div className="space-y-3">
        {DAYS.map((day) => {
          const entry = getEntry(day);
          const isEditing = editingDay === day;

          return (
            <div key={day} className="flex items-start gap-3">
              <span className="w-24 flex-shrink-0 pt-0.5 text-sm font-medium text-gray-500">
                {day}
              </span>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      rows={2}
                      value={draftNote}
                      onChange={(e) => setDraftNote(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                      placeholder={`How did ${day} go?`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEntry(day)}
                        disabled={saving}
                        className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingDay(null)}
                        className="rounded-md px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : entry ? (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-700">{entry.note}</p>
                    <button
                      onClick={() => startEdit(day)}
                      className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-700"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(day)}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    + Add note
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/JournalSection.tsx
git commit -m "feat: add interactive journal section with per-day notes"
```

---

### Task 14: Timeline/History Page

**Files:**
- Create: `components/PlanCard.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/PlanCard.tsx`**

```tsx
import Link from 'next/link';
import type { PlanSummary, JournalEntry } from '@/lib/types';

interface Props {
  plan: PlanSummary;
  journalEntries: JournalEntry[];
}

export function PlanCard({ plan, journalEntries }: Props) {
  const weekLabel = new Date(plan.weekOf + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Pick notable dinners for the summary (skip days with no dinner)
  const highlightMeals = plan.meals
    .filter((m) => m.dinner?.name)
    .slice(0, 3)
    .map((m) => m.dinner.name);

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400">Week of {weekLabel}</p>
          <h2 className="mt-0.5 text-lg font-semibold text-gray-900">
            {plan.theme || 'Weekly Meal Plan'}
          </h2>
        </div>
        <Link
          href={`/plan/${plan.id}`}
          className="flex-shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900"
        >
          View Full Plan →
        </Link>
      </div>

      {/* Cooking projects */}
      {plan.cookingProjects.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Cooking Projects
          </p>
          <ul className="mt-1 space-y-0.5">
            {plan.cookingProjects.map((p, i) => (
              <li key={i} className="text-sm text-gray-700">
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Highlight meals */}
      {highlightMeals.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Key Dinners
          </p>
          <p className="mt-1 text-sm text-gray-700">{highlightMeals.join(' · ')}</p>
        </div>
      )}

      {/* Journal notes */}
      {journalEntries.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Journal
          </p>
          {journalEntries.map((entry, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="w-20 flex-shrink-0 text-gray-400">{entry.day}</span>
              <span className="text-gray-700">{entry.note}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
import { listPlans, getJournal } from '@/lib/storage';
import { PlanCard } from '@/components/PlanCard';
import Link from 'next/link';

export default async function HomePage() {
  const plans = await listPlans();

  const plansWithJournals = await Promise.all(
    plans.map(async (plan) => {
      const journal = await getJournal(plan.id);
      return { plan, journalEntries: journal?.entries ?? [] };
    }),
  );

  if (plansWithJournals.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">No meal plans yet.</p>
        <Link
          href="/new"
          className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Generate your first plan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Meal Plan History</h1>
      {plansWithJournals.map(({ plan, journalEntries }) => (
        <PlanCard key={plan.id} plan={plan} journalEntries={journalEntries} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/PlanCard.tsx app/page.tsx
git commit -m "feat: add timeline/history page with plan cards and journal previews"
```

---

## Self-Review: Spec Coverage Check

| Spec requirement | Covered by |
|---|---|
| Next.js App Router + TypeScript + Tailwind | Task 1 |
| `/` timeline feed with inline journal | Task 14 |
| `/new` form with all fields | Task 10 |
| `/plan/[id]` full plan detail | Task 12 |
| Top nav bar (blog-style) | Task 9 |
| HEB Sales red card | Task 11 (PlanDetail.tsx) |
| In Season green card | Task 11 (PlanDetail.tsx) |
| Weekend cooking projects list | Task 11 |
| Breakfast options | Task 11 |
| 7-day meal table with flags | Task 11 (MealTable.tsx) |
| ⚡ EASY ASSEMBLY / 🍳 ONE PAN flags | Task 11 (MealTable.tsx) |
| Grocery list by section, sale items in red | Task 11 (GroceryList.tsx) |
| Inline journal with "+ Add note" per day | Task 13 |
| `/api/generate` — streaming POST | Task 6 |
| `/api/plans` GET (list) | Task 7 |
| `/api/plans/[id]` GET | Task 7 |
| `/api/journal` POST | Task 8 |
| `/api/journal/[planId]` GET | Task 8 |
| JSON file storage in `data/` | Task 4 |
| Plan schema with all fields | Task 3 |
| Journal schema | Task 3 |
| Prompt assembly with override block | Task 5 |
| SYSTEM_PROMPT with sesame allergy warning | Task 5 |
| Claude streaming API | Task 6 |
| Web search tool enabled | Task 6 |
| Error banner for malformed JSON | Task 6 (ERROR token → error state in Task 10) |
| Missing API key message | Task 10 |
| File write failures → 500 | Tasks 7, 8 |
| `.gitignore` with data/ and .env.local | Task 1 |
| ESLint + Prettier | Task 2 |
| Husky pre-commit hooks | Task 2 |
| Jest unit tests for storage | Task 4 |
| Jest unit tests for prompt assembly | Task 5 |
| File naming: `YYYY-MM-DD-<uuid>.json` | Task 4 |
| UUID collision prevention | Task 4, 6 |
| Plans sorted newest first | Task 4 |
