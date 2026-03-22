import OpenAI from "openai";

/**
 * Create an OpenAI client from the given API key.
 */
const getClient = (apiKey) => new OpenAI({ apiKey });

const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Helper: call OpenAI chat completions and return text + token usage.
 */
const complete = async (prompt, apiKey, options = {}) => {
  const client = getClient(apiKey);
  const response = await client.chat.completions.create({
    model: options.model || DEFAULT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  });

  const text = response.choices?.[0]?.message?.content || "";
  const usage = response.usage || {};

  return {
    text,
    inputTokens: usage.prompt_tokens || 0,
    outputTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    model: response.model || DEFAULT_MODEL,
  };
};

// ─── Flashcards ───
export const generateFlashcards = async (text, count = 10, apiKey) => {
  const prompt = `Generate ${count} flashcards from the following text.
Format each flashcard as:
Q: [clear, specific question]
A: [concise, accurate answer]
D: [Difficulty: easy, medium or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}`;

  try {
    const result = await complete(prompt, apiKey);
    const flashcards = [];
    const cards = result.text.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "", answer = "", difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) question = line.substring(2).trim();
        else if (line.startsWith("A:")) answer = line.substring(2).trim();
        else if (line.startsWith("D:")) {
          const d = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(d)) difficulty = d;
        }
      }
      if (question && answer) flashcards.push({ question, answer, difficulty });
    }

    return {
      data: flashcards.slice(0, count),
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
        model: result.model,
      },
    };
  } catch (error) {
    console.error("OpenAI generateFlashcards error:", error);
    throw new Error("Failed to generate flashcards with OpenAI");
  }
};

// ─── Quiz ───
export const generateQuiz = async (text, numQuestions = 5, apiKey) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text:
Q: [Question]
O1: [Option 1]
O2: [Option 2]
O3: [Option 3]
O4: [Option 4]
C: [Correct Option - exactly as written]
E: [Brief explanation]
D: [Difficulty: easy, medium or hard]

Separate questions with "---"

Text:
${text.substring(0, 15000)}`;

  try {
    const result = await complete(prompt, apiKey);
    const questions = [];
    const cards = result.text.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "", options = [], answer = "", explanation = "", difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) question = line.substring(2).trim();
        else if (line.startsWith("O1:")) options.push(line.substring(3).trim());
        else if (line.startsWith("O2:")) options.push(line.substring(3).trim());
        else if (line.startsWith("O3:")) options.push(line.substring(3).trim());
        else if (line.startsWith("O4:")) options.push(line.substring(3).trim());
        else if (line.startsWith("C:")) answer = line.substring(2).trim();
        else if (line.startsWith("E:")) explanation = line.substring(2).trim();
        else if (line.startsWith("D:")) {
          const d = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(d)) difficulty = d;
        }
      }
      if (question && options.length >= 4 && answer) {
        questions.push({ question, options, answer, explanation, difficulty });
      }
    }

    return {
      data: questions.slice(0, numQuestions),
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
        model: result.model,
      },
    };
  } catch (error) {
    console.error("OpenAI generateQuiz error:", error);
    throw new Error("Failed to generate quiz with OpenAI");
  }
};

// ─── Summary ───
export const generateSummary = async (text, apiKey) => {
  const prompt = `Generate a concise summary highlighting key concepts, main ideas, and important details. Keep it clear and structured:

Text:
${text.substring(0, 15000)}`;

  try {
    const result = await complete(prompt, apiKey);
    return {
      data: result.text,
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
        model: result.model,
      },
    };
  } catch (error) {
    console.error("OpenAI generateSummary error:", error);
    throw new Error("Failed to generate summary with OpenAI");
  }
};

// ─── Chat ───
export const chatWithContext = async (question, chunks, apiKey) => {
  const context = chunks.map((chunk) => chunk.content || chunk.text).join("\n\n");

  const prompt = `Based on the following context, answer the user's question. If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:`;

  try {
    const result = await complete(prompt, apiKey);
    return {
      data: result.text,
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
        model: result.model,
      },
    };
  } catch (error) {
    console.error("OpenAI chatWithContext error:", error);
    throw new Error("Failed to chat with OpenAI");
  }
};

// ─── Explain Concept ───
export const explainConcept = async (concept, chunks, apiKey) => {
  const context = chunks.map((chunk) => chunk.content || chunk.text).join("\n\n");

  const prompt = `Explain the following concept in detail based on the context below.
Provide a clear, educational explanation. Include examples if relevant.

Context:
${context.substring(0, 15000)}

Concept: ${concept}`;

  try {
    const result = await complete(prompt, apiKey);
    return {
      data: result.text,
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
        model: result.model,
      },
    };
  } catch (error) {
    console.error("OpenAI explainConcept error:", error);
    throw new Error("Failed to explain concept with OpenAI");
  }
};
