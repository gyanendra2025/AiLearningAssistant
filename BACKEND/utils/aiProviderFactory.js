import * as geminiService from "./geminiService.js";

/**
 * Lazy-loaded OpenAI service. Only imported when a user has an OpenAI key.
 */
let _openaiService = null;
const getOpenAIService = async () => {
  if (!_openaiService) {
    _openaiService = await import("./openaiService.js");
  }
  return _openaiService;
};

/**
 * Returns the correct AI service based on provider name.
 * @param {"gemini" | "openai"} provider
 * @returns {{ generateFlashcards, generateQuiz, generateSummary, chatWithContext, explainConcept }}
 */
export const getAiService = async (provider) => {
  if (provider === "openai") {
    return getOpenAIService();
  }
  return geminiService;
};

/**
 * Estimate cost for a given provider and token count.
 * Prices are approximate per-million-tokens.
 */
export const estimateCost = (provider, inputTokens, outputTokens) => {
  const pricing = {
    gemini: { input: 0.075, output: 0.30 }, // Gemini 2.0 Flash per 1M tokens
    openai: { input: 0.15, output: 0.60 },  // GPT-4o-mini per 1M tokens
  };

  const p = pricing[provider] || pricing.gemini;
  const cost =
    (inputTokens / 1_000_000) * p.input +
    (outputTokens / 1_000_000) * p.output;
  return Math.round(cost * 1_000_000) / 1_000_000; // Round to 6 decimal places
};
