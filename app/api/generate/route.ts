import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import { assemblePrompt, SYSTEM_PROMPT } from '@/lib/prompt';
import { savePlan } from '@/lib/storage';
import type { Plan, PlanFormInputs } from '@/lib/types';

const DONE_TOKEN = '__PLAN_SAVED__';

function parsePlanResponse(jsonText: string, inputs: PlanFormInputs): Plan {
  // Strip markdown code fences if Claude wrapped the JSON anyway
  const cleaned = jsonText
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const parsed = JSON.parse(cleaned);

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not set. Add it to .env.local.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const anthropic = new Anthropic({ apiKey });
  const userPrompt = assemblePrompt(inputs);

  const encoder = new TextEncoder();
  let fullText = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 8096,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
          tools: [
            { type: 'web_search_20250305', name: 'web_search', max_uses: 3 } as Parameters<
              typeof anthropic.messages.stream
            >[0]['tools'][0],
          ],
        });

        for await (const chunk of messageStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        // Parse and save the complete plan
        let planId: string;
        try {
          const plan = parsePlanResponse(fullText, inputs);
          await savePlan(plan);
          planId = plan.id;
        } catch {
          controller.enqueue(encoder.encode(`\n${DONE_TOKEN}:ERROR`));
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
