import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate text embedding using Gemini or OpenAI.
 * @param {string} text - text to embed
 * @param {"gemini"|"openai"} provider
 * @param {string} apiKey
 * @returns {Promise<number[]>} - embedding vector
 */
export const generateEmbedding = async (text, provider = "gemini", apiKey) => {
  if (provider === "openai") {
    return generateOpenAIEmbedding(text, apiKey);
  }
  return generateGeminiEmbedding(text, apiKey);
};

/**
 * Gemini embedding using text-embedding-004
 */
const generateGeminiEmbedding = async (text, apiKey) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("No Gemini API key for embeddings");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text.substring(0, 10000));
  return result.embedding.values;
};

/**
 * OpenAI embedding using text-embedding-3-small
 */
const generateOpenAIEmbedding = async (text, apiKey) => {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey });
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8000),
  });
  return response.data[0].embedding;
};

/**
 * Cosine similarity between two vectors.
 */
export const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Find most relevant chunks using vector similarity.
 * Falls back to keyword matching if no embeddings available.
 * @param {Array} chunks - document chunks with optional 'embedding' field
 * @param {number[]} questionEmbedding - embedding of the user's question
 * @param {number} topK - number of chunks to return
 * @returns {Array} - top K most relevant chunks
 */
export const findRelevantChunksByEmbedding = (chunks, questionEmbedding, topK = 3) => {
  if (!questionEmbedding || !chunks?.length) return chunks?.slice(0, topK) || [];

  // Check if chunks have embeddings
  const hasEmbeddings = chunks.some((c) => c.embedding && c.embedding.length > 0);
  if (!hasEmbeddings) {
    // Fallback: return first N chunks
    return chunks.slice(0, topK);
  }

  const scored = chunks
    .filter((c) => c.embedding && c.embedding.length > 0)
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
};
