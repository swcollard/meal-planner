import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { generatePlanText } from '@/lib/claude';
import { assemblePrompt, SYSTEM_PROMPT } from '@/lib/prompt';
import { savePlan } from '@/lib/storage';
import type { Plan, PlanFormInputs } from '@/lib/types';

const DONE_TOKEN = '__PLAN_SAVED__';

function parsePlanResponse(jsonText: string, inputs: PlanFormInputs): Plan {
  // Strip markdown code fences if Claude wrapped the JSON
  const cleaned = jsonText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Extract JSON object from response — Claude may include text before/after
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON object found in response');

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    id: randomUUID(),
    weekOf: inputs.weekOf,
    theme: inputs.theme || 'Weekly Plan',
    createdAt: new Date().toISOString(),
    formInputs: inputs,
    sales: parsed.sales ?? [],
    seasonal: parsed.seasonal ?? [],
    cookingProjects: parsed.cookingProjects ?? [],
    breakfast: parsed.breakfast ?? [],
    meals: parsed.meals ?? [],
    groceryList: parsed.groceryList ?? {
      'Meat & Seafood': [],
      Produce: [],
      'Dairy & Eggs': [],
      'Pantry & Dry Goods': [],
    },
  };
}

export async function POST(request: NextRequest) {
  const inputs = (await request.json()) as PlanFormInputs;
  const userPrompt = assemblePrompt(inputs);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode('Searching for HEB sales and seasonal produce...\n'));

        const resultText = await generatePlanText(SYSTEM_PROMPT, userPrompt, () =>
          controller.enqueue(encoder.encode('.')),
        );

        if (!resultText) {
          controller.enqueue(encoder.encode(`\n${DONE_TOKEN}:ERROR:No response from Claude`));
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode('\nParsing meal plan...\n'));

        // Parse and save the plan
        let planId: string;
        try {
          const plan = parsePlanResponse(resultText, inputs);
          await savePlan(plan);
          planId = plan.id;
        } catch (parseErr) {
          const detail = parseErr instanceof Error ? parseErr.message : 'Failed to parse response';
          controller.enqueue(encoder.encode(`\n${DONE_TOKEN}:ERROR:${detail}`));
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(`\n${DONE_TOKEN}:${planId}`));
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`\n${DONE_TOKEN}:ERROR:${message}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
