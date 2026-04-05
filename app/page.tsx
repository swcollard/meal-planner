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
