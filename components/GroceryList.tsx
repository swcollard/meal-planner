import type { GroceryList as GroceryListType } from '@/lib/types';

const SECTIONS = ['Meat & Seafood', 'Produce', 'Dairy & Eggs', 'Pantry & Dry Goods'] as const;

export function GroceryList({ groceryList }: { groceryList: GroceryListType }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {SECTIONS.map((section) => {
        const items = groceryList[section] ?? [];
        if (items.length === 0) return null;
        return (
          <div key={section}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {section}
            </h3>
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  {item.onSale && <span className="text-xs font-bold text-red-600">SALE</span>}
                  <span className={item.onSale ? 'text-red-700 font-medium' : ''}>{item.item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
