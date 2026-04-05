import { getJournal } from '@/lib/storage';

export async function GET(_request: Request, { params }: { params: Promise<{ planId: string }> }) {
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
