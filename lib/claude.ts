import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-sonnet-5-5';

const MAX_TOKENS = 64000;
const MAX_CONTINUATIONS = 5;

/**
 * Runs the meal-plan prompt against the Claude API with server-side web search and
 * returns the model's final text. `onProgress` fires as searches start and text streams in.
 */
export async function generatePlanText(
  systemPrompt: string,
  userPrompt: string,
  onProgress: () => void,
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set. Add it to .env.local.');
  }

  const client = new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: userPrompt }];

  // Server-side tool loops can hit the per-turn iteration limit and return `pause_turn`;
  // resuming means sending the assistant content back as-is.
  for (let attempt = 0; attempt <= MAX_CONTINUATIONS; attempt++) {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
      output_config: { effort: 'medium' },
      tools: [
        {
          type: 'web_search_20260209',
          name: 'web_search',
          max_uses: 10,
          user_location: { type: 'approximate', country: 'US', region: 'Texas' },
        },
      ],
      // Retry on another model if the safety classifiers decline the request.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });

    for await (const event of stream) {
      if (event.type === 'content_block_start' && event.content_block.type === 'server_tool_use') {
        onProgress();
      }
    }
    const message = await stream.finalMessage();

    if (message.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: message.content });
      continue;
    }
    if (message.stop_reason === 'refusal') {
      throw new Error('Claude declined to generate this plan.');
    }
    if (message.stop_reason === 'max_tokens') {
      throw new Error('Response was cut off before the plan finished.');
    }

    return message.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim();
  }

  throw new Error('Claude did not finish within the allowed number of web search rounds.');
}
