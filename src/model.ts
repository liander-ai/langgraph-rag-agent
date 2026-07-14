import { ChatAnthropic } from "@langchain/anthropic";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * Real chat model for live runs. Requires ANTHROPIC_API_KEY.
 * Tests inject a fake model instead, so they need no key and cost nothing.
 */
export function getChatModel(): BaseChatModel {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "Set ANTHROPIC_API_KEY to run against a real model. (Tests use a fake model and need no key.)"
    );
  }
  return new ChatAnthropic({ model: "claude-3-5-haiku-latest", temperature: 0 });
}
