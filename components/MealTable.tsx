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
