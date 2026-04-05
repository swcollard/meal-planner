import { getPlan } from '@/lib/storage';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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
