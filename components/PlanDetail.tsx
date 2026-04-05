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
      <div>
        <p className="text-sm text-gray-500">Week of {weekLabel}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          {plan.theme || 'Weekly Meal Plan'}
        </h1>
      </div>

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

      {plan.seasonal.length > 0 && (
        <section className="rounded-lg border border-green-200 bg-green-50 p-5">
          <h2 className="mb-3 text-base font-semibold text-green-800">🌿 In Season in Texas</h2>
          <div className="flex flex-wrap gap-2">
            {plan.seasonal.map((item, i) => (
              <span key={i} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                {item}
              </span>
            ))}
          </div>
        </section>
      )}

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

      {plan.breakfast.length > 0 && (
        <Section title="☀️ Breakfast Options">
          <ul className="space-y-2">
            {plan.breakfast.map((b, i) => (
              <li key={i}>
                <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                {b.description && <p className="text-sm text-gray-600">{b.description}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {plan.meals.length > 0 && (
        <Section title="📅 Meal Schedule">
          <MealTable meals={plan.meals} />
        </Section>
      )}

      {plan.groceryList && (
        <Section title="🛍 Grocery List">
          <GroceryList groceryList={plan.groceryList} />
        </Section>
      )}
    </div>
  );
}
