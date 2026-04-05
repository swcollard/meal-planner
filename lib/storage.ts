import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Plan, PlanSummary, Journal } from './types';

export const DATA_DIR = process.env.MEAL_PLANNER_DATA_DIR ?? path.join(process.cwd(), 'data');

function getPlansDir() {
  return path.join(process.env.MEAL_PLANNER_DATA_DIR ?? path.join(process.cwd(), 'data'), 'plans');
}
function getJournalDir() {
  return path.join(
    process.env.MEAL_PLANNER_DATA_DIR ?? path.join(process.cwd(), 'data'),
    'journal',
  );
}

function ensureDirs() {
  fs.mkdirSync(getPlansDir(), { recursive: true });
  fs.mkdirSync(getJournalDir(), { recursive: true });
}

function planFileName(weekOf: string, id: string): string {
  return path.join(getPlansDir(), `${weekOf}-${id}.json`);
}

function journalFileName(weekOf: string, id: string): string {
  return path.join(getJournalDir(), `${weekOf}-${id}.json`);
}

export async function savePlan(plan: Plan): Promise<void> {
  ensureDirs();
  const filePath = planFileName(plan.weekOf, plan.id);
  fs.writeFileSync(filePath, JSON.stringify(plan, null, 2), 'utf-8');
}

export async function getPlan(id: string): Promise<Plan | null> {
  ensureDirs();
  const files = fs.readdirSync(getPlansDir());
  const file = files.find((f) => f.includes(id));
  if (!file) return null;
  const content = fs.readFileSync(path.join(getPlansDir(), file), 'utf-8');
  return JSON.parse(content) as Plan;
}

export async function listPlans(): Promise<PlanSummary[]> {
  ensureDirs();
  const files = fs.readdirSync(getPlansDir());
  const plans: Plan[] = files
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const content = fs.readFileSync(path.join(getPlansDir(), f), 'utf-8');
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

export async function saveJournal(input: Omit<Journal, 'id'>): Promise<Journal> {
  ensureDirs();
  const existing = await getJournal(input.planId);

  if (existing) {
    const updated: Journal = { ...existing, entries: input.entries };
    const files = fs.readdirSync(getJournalDir());
    const file = files.find((f) => f.includes(existing.id));
    if (file) {
      fs.writeFileSync(path.join(getJournalDir(), file), JSON.stringify(updated, null, 2), 'utf-8');
    }
    return updated;
  }

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
  const files = fs.readdirSync(getJournalDir());
  for (const file of files) {
    const content = fs.readFileSync(path.join(getJournalDir(), file), 'utf-8');
    const journal = JSON.parse(content) as Journal;
    if (journal.planId === planId) return journal;
  }
  return null;
}
