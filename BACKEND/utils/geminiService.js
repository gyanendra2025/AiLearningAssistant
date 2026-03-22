import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

const DEFAULT_MODEL = "gemini-2.0-flash";

/**
 * Get a Gemini model instance.
 * Uses the provided apiKey, or falls back to the env variable.
 */
const getModel = (apiKey) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("No Gemini API key provided. Please add one in Settings.");
  }
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: DEFAULT_MODEL });
};

/**
 * Helper: call Gemini and return text + token usage.
 */
const complete = async (prompt, apiKey) => {
  const model = getModel(apiKey);
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Extract token usage from Gemini response if available
  const usage = response.usageMetadata || {};

  return {
    text,
    inputTokens: usage.promptTokenCount || 0,
    outputTokens: usage.candidatesTokenCount || 0,
    totalTokens: usage.totalTokenCount || 0,
    model: DEFAULT_MODEL,
  };
};

// ─── Flashcards ───
export const generateFlashcards = async (text, count = 10, apiKey) => {
  const prompt = `Generate ${count} flashcards for the following text:
 Format each flashcard as:
 Q: [clear,specific question]
 A: [concise ,accurate answer]
 D: [Difficulty level: easy, medium or hard]

 separate each flashcard with "---"

 Text:
 ${text.substring(0, 15000)} `;

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
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
};

// ─── Quiz ───
export const generateQuiz = async (text, numQuestions = 5, apiKey) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions for the following text: 
    Q: [Questions]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    C: [Correct Option-exactly as written above]
    E: [Brief explanation]
    D: [Difficulty level: easy, medium or hard]

    separate questions with "---"

    Text:
    ${text.substring(0, 15000)} `;

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
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz");
  }
};

// ─── Summary ───
export const generateSummary = async (text, apiKey) => {
  const prompt = `Generate a concise summary of the following text, highlighting the key concept, main ideas, and any important details. Keep summary clear and structured:
    Text:   
    ${text.substring(0, 15000)} `;

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
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
};

// ─── Chat ───
export const chatWithContext = async (question, chunks, apiKey) => {
  const context = chunks.map((chunk) => chunk.content || chunk.text).join("\n\n");

  const prompt = `Based on the following context from a document, analyze the content and answer the user's question. If the answer is not in the context, say so.
    
    Context:
    ${context}
    
    Question: ${question}
    
    Answer:
    `;

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
    console.error("Error generating chat with context:", error);
    throw new Error("Failed to generate chat with context");
  }
};

// ─── Explain Concept ───
export const explainConcept = async (concept, chunks, apiKey) => {
  const context = chunks.map((chunk) => chunk.content || chunk.text).join("\n\n");

  const prompt = `Explain the following concept in detail based on the following context:
    Provide a clear and educational explanation that is easy to understand and structured.
    Include examples if relevant.
    
    Context:
    ${context.substring(0, 15000)}
    
    Concept: ${concept}
    `;

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
    console.error("Error explaining concept:", error);
    throw new Error("Failed to explain concept");
  }
};
