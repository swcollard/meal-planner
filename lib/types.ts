// Form inputs from the /new page
export interface PlanFormInputs {
  weekOf: string; // ISO date string, e.g. "2026-04-07"
  theme: string;
  avoid: string;
  feature: string;
  easyCleanupDays: string[]; // e.g. ["Wednesday"]
  easyLunchDay: string; // e.g. "Tuesday"
  notes: string;
}

// A single meal (lunch or dinner)
export interface Meal {
  name: string;
  flags: Array<'easy-assembly' | 'one-pan'>;
}

// One day's meals
export interface DayMeals {
  day: string; // "Sunday" through "Saturday"
  lunch: Meal;
  dinner: Meal;
}

// A cooking project for the weekend
export interface CookingProject {
  name: string;
  description: string;
}

// A breakfast option
export interface BreakfastOption {
  name: string;
  description: string;
}

// A sale item
export interface SaleItem {
  item: string;
  price: string;
}

// A grocery list item
export interface GroceryItem {
  item: string;
  onSale: boolean;
}

// Grocery list organized by section
export interface GroceryList {
  'Meat & Seafood': GroceryItem[];
  Produce: GroceryItem[];
  'Dairy & Eggs': GroceryItem[];
  'Pantry & Dry Goods': GroceryItem[];
}

// A full meal plan (stored as JSON file)
export interface Plan {
  id: string;
  weekOf: string; // ISO date string, e.g. "2026-04-07"
  theme: string;
  createdAt: string; // ISO datetime string
  formInputs: PlanFormInputs;
  sales: SaleItem[];
  seasonal: string[];
  cookingProjects: CookingProject[];
  breakfast: BreakfastOption[];
  meals: DayMeals[];
  groceryList: GroceryList;
}

// A plan summary for the timeline feed (no full meals/grocery detail)
export interface PlanSummary {
  id: string;
  weekOf: string;
  theme: string;
  createdAt: string;
  cookingProjects: CookingProject[];
  meals: DayMeals[];
}

// A single journal entry for one day
export interface JournalEntry {
  day: string;
  note: string;
}

// A journal document for a plan (stored as JSON file)
export interface Journal {
  id: string;
  planId: string;
  weekOf: string;
  entries: JournalEntry[];
}
