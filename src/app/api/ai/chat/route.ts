import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { getAIProvider, getModelId, buildSystemPrompt } from '@/lib/ai';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    context,
  }: { messages: UIMessage[]; context?: string } = await req.json();

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          'OPENAI_API_KEY is not configured. Please set it in .env.local',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const provider = getAIProvider();
  const modelId = getModelId();
  const systemPrompt = await buildSystemPrompt(context);

  const result = streamText({
    model: provider(modelId),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
