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
