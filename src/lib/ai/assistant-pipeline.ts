// ---------------------------------------------------------------------------
// TIGI Aria Assistant Pipeline
//
// Thin delegation layer — all logic lives in the AI orchestrator.
// Kept as a named module so existing imports (api/assistant/chat) are stable.
//
// To add behaviour (streaming, tools, memory), extend the orchestrator or
// add a new method there — do not add logic here.
// ---------------------------------------------------------------------------

export type { ChatMessage } from './ai-types'
import type { ChatMessage } from './ai-types'
import type { AIContext } from './ai-types'
import type { ContentBlock } from '@/lib/assistant/mock-assistant-data'
import { getAIOrchestrator } from './orchestrator'

/**
 * Run one Aria conversation turn.
 *
 * @param messages  Conversation history from the client (capped at 20 by the API route)
 * @param context   Optional user context — enables personalised system prompt
 * @returns         ContentBlock[] to render in the assistant panel
 */
export async function runAssistantPipeline(
  messages: ChatMessage[],
  context?: AIContext,
): Promise<ContentBlock[]> {
  const response = await getAIOrchestrator().chat(messages, context)
  return response.result
}
