import OpenAI from "openai";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  timeout: 45 * 1000,
  maxRetries: 1,
});

const MODEL = "nvidia/nemotron-nano-9b-v2:free";

export class AiRateLimitError extends Error {
  constructor() {
    super("You've reached today's AI usage limit. Please try again tomorrow.");
    this.name = "AiRateLimitError";
  }
}

function isRateLimitError(err: unknown): boolean {
  return err instanceof OpenAI.APIError && err.status === 429;
}

async function createCompletion(params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming) {
  try {
    return await openrouter.chat.completions.create(params);
  } catch (err) {
    if (isRateLimitError(err)) throw new AiRateLimitError();
    throw err;
  }
}

export async function completeJson<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const response = await createCompletion({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("The AI provider is temporarily unavailable. Please try again.");

  return JSON.parse(content) as T;
}

export async function completeText(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await createCompletion({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("The AI provider is temporarily unavailable. Please try again.");

  return content;
}
