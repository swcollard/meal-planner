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
