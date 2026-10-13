import { randomUUID } from 'crypto';
import type { DocumentData } from '@gusto/baerly-storage';
import { getDb } from './db';
import type { Plan, PlanSummary, Journal } from './types';

// Our domain types are JSON-shaped but lack baerly's index signature, so we
// cross the write boundary through `DocumentData`.
function asDoc<T extends object>(value: T): DocumentData {
  return value as unknown as DocumentData;
}

// baerly mints a server-side `_id` on every row; strip it so return shapes
// match our own `Plan`/`Journal` types (which key off our own `id` field).
function stripId<T>(doc: T & { _id?: string }): T {
  const { _id, ...rest } = doc;
  void _id;
  return rest as T;
}

export async function savePlan(plan: Plan): Promise<void> {
  await getDb().collection('plans').insert(asDoc(plan));
}

export async function getPlan(id: string): Promise<Plan | null> {
  const doc = await getDb().collection('plans').where({ id }).first();
  return doc ? stripId(doc as unknown as Plan) : null;
}

export async function listPlans(): Promise<PlanSummary[]> {
  const docs = (await getDb().collection('plans').all()) as unknown as Plan[];

  return docs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(({ id, weekOf, theme, createdAt, cookingProjects, meals }): PlanSummary => ({
      id,
      weekOf,
      theme,
      createdAt,
      cookingProjects,
      meals,
    }));
}

export async function saveJournal(input: Omit<Journal, 'id'>): Promise<Journal> {
  const existing = await getDb().collection('journal').where({ planId: input.planId }).first();

  if (existing) {
    await getDb()
      .collection('journal')
      .update(existing._id as string, asDoc({ entries: input.entries }));
    return { ...stripId(existing as unknown as Journal), entries: input.entries };
  }

  const journal: Journal = { id: randomUUID(), ...input };
  await getDb().collection('journal').insert(asDoc(journal));
  return journal;
}

export async function getJournal(planId: string): Promise<Journal | null> {
  const doc = await getDb().collection('journal').where({ planId }).first();
  return doc ? stripId(doc as unknown as Journal) : null;
}
