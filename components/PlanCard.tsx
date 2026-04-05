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

      {highlightMeals.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Key Dinners
          </p>
          <p className="mt-1 text-sm text-gray-700">{highlightMeals.join(' · ')}</p>
        </div>
      )}

      {journalEntries.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Journal</p>
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
