import type { PlanFormInputs } from './types';

export const SYSTEM_PROMPT = `You are a weekly meal planning assistant for a family of 3 in Texas.

You have access to web search. Use it to find:
1. This week's HEB weekly grocery ad (search "HEB weekly ad [current month year]")
2. What produce is currently in season in Texas (search "Texas produce in season [current month]")

CRITICAL CONSTRAINT — SEVERE SESAME ALLERGY: Never include sesame seeds, sesame oil, tahini, sesame paste, hummus (often contains tahini), or any product that may contain sesame. This is a life-threatening allergy. Double-check every ingredient and dish name.

Your response must be ONLY a valid JSON object — no markdown formatting, no code blocks, no explanation text before or after. The JSON must exactly match this schema:

{
  "sales": [{ "item": string, "price": string }],
  "seasonal": [string],
  "cookingProjects": [{ "name": string, "description": string }],
  "breakfast": [{ "name": string, "description": string }],
  "meals": [
    {
      "day": "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday",
      "lunch": { "name": string, "flags": ("easy-assembly" | "one-pan")[] },
      "dinner": { "name": string, "flags": ("easy-assembly" | "one-pan")[] }
    }
  ],
  "groceryList": {
    "Meat & Seafood": [{ "item": string, "onSale": boolean }],
    "Produce": [{ "item": string, "onSale": boolean }],
    "Dairy & Eggs": [{ "item": string, "onSale": boolean }],
    "Pantry & Dry Goods": [{ "item": string, "onSale": boolean }]
  }
}

All 7 days (Sunday through Saturday) must be included in "meals". Sale items in groceryList should have "onSale": true.`;

export function assemblePrompt(inputs: PlanFormInputs): string {
  const overrides: string[] = [];

  if (inputs.theme) overrides.push(`THEME: ${inputs.theme}`);
  if (inputs.avoid) overrides.push(`AVOID: ${inputs.avoid}`);
  if (inputs.feature) overrides.push(`FEATURE: ${inputs.feature}`);
  if (inputs.easyCleanupDays.length > 0) {
    overrides.push(`EASY CLEANUP: ${inputs.easyCleanupDays.join(', ')}`);
  }
  if (inputs.easyLunchDay) overrides.push(`EASY LUNCH: ${inputs.easyLunchDay}`);

  let prompt = `Generate a complete weekly meal plan for the week of ${inputs.weekOf}.`;

  if (overrides.length > 0) {
    prompt += `\n\nOverrides for this week:\n${overrides.join('\n')}`;
  }

  if (inputs.notes.trim()) {
    prompt += `\n\nAdditional notes: ${inputs.notes.trim()}`;
  }

  return prompt;
}
