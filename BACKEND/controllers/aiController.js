import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import ApiKey from "../models/ApiKey.js";
import ApiUsage from "../models/ApiUsage.js";
import { getAiService, estimateCost } from "../utils/aiProviderFactory.js";
import { decrypt } from "../utils/encryption.js";
import { findRelevantChunk } from "../utils/textChunker.js";
import { generateEmbedding, findRelevantChunksByEmbedding } from "../utils/embeddingService.js";

/**
 * Helper: Get the user's active API key and provider.
 * Returns { provider, apiKey (decrypted), keyId } or null if no key.
 * NO env fallback — user must configure their own key.
 */
const getUserApiKey = async (userId) => {
  const activeKey = await ApiKey.findOne({ userId, isActive: true });
  if (!activeKey) {
    return null;
  }
  const decryptedKey = decrypt(activeKey.encryptedKey);
  return { provider: activeKey.provider, apiKey: decryptedKey, keyId: activeKey._id };
};

/**
 * Helper: Standard error when no API key is configured
 */
const noApiKeyError = (res) => {
  return res.status(403).json({
    success: false,
    error: "No API key configured. Please add your API key in Settings first.",
    code: "API_KEY_REQUIRED",
  });
};

/**
 * Helper: Log API usage to database
 */
const logUsage = async (userId, provider, action, usage, success = true, errorMessage = "") => {
  try {
    const cost = estimateCost(provider, usage?.inputTokens || 0, usage?.outputTokens || 0);
    await ApiUsage.create({
      userId,
      provider,
      action,
      model: usage?.model || "",
      inputTokens: usage?.inputTokens || 0,
      outputTokens: usage?.outputTokens || 0,
      totalTokens: usage?.totalTokens || 0,
      estimatedCost: cost,
      success,
      errorMessage,
    });

    // Update lastUsedAt on the API key
    if (success) {
      await ApiKey.findOneAndUpdate(
        { userId, isActive: true },
        { lastUsedAt: new Date() }
      );
    }
  } catch (err) {
    console.error("Failed to log usage:", err.message);
  }
};

// ──────────────── Generate Flashcards ────────────────
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, error: "Document ID is required" });
    }

    const userKey = await getUserApiKey(req.user._id);
    if (!userKey) {
      return noApiKeyError(res);
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    const service = await getAiService(userKey.provider);
    const result = await service.generateFlashcards(document.extractedText, parseInt(count), userKey.apiKey);

    const flashcards = result.data || result;
    const usage = result.usage || {};

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: (Array.isArray(flashcards) ? flashcards : []).map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });

    await logUsage(req.user._id, userKey.provider, "generate-flashcards", usage);

    res.status(201).json({
      success: true,
      data: flashcardSet,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────── Generate Quiz ────────────────
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5 } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, error: "Document ID is required" });
    }

    const userKey = await getUserApiKey(req.user._id);
    if (!userKey) {
      return noApiKeyError(res);
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    const service = await getAiService(userKey.provider);
    const result = await service.generateQuiz(document.extractedText, parseInt(numQuestions), userKey.apiKey);

    const questions = result.data || result;
    const usage = result.usage || {};

    const quizSet = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: `${document.title}-Quiz`,
      questions: Array.isArray(questions) ? questions : [],
      totalQuestions: Array.isArray(questions) ? questions.length : 0,
      userAnswers: [],
      score: 0,
    });

    await logUsage(req.user._id, userKey.provider, "generate-quiz", usage);

    res.status(201).json({
      success: true,
      data: quizSet,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────── Generate Summary ────────────────
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, error: "Document ID is required" });
    }

    const userKey = await getUserApiKey(req.user._id);
    if (!userKey) {
      return noApiKeyError(res);
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    const service = await getAiService(userKey.provider);
    const result = await service.generateSummary(document.extractedText, userKey.apiKey);

    const summary = result.data || result;
    const usage = result.usage || {};

    await logUsage(req.user._id, userKey.provider, "generate-summary", usage);

    res.status(201).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary: summary,
      },
      message: "Summary generated successfully",
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────── Chat ────────────────
export const chat = async (req, res, next) => {
  try {
    const { documentId, question, message } = req.body;
    const userQuestion = question || message;

    if (!documentId) {
      return res.status(400).json({ success: false, error: "Document ID is required" });
    }

    const userKey = await getUserApiKey(req.user._id);
    if (!userKey) {
      return noApiKeyError(res);
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    const relevantChunk = findRelevantChunk(document.chunks, userQuestion, 3);
    const chunkIndices = relevantChunk.map((chunk) => chunk.chunkIndex);

    let chatHistory = await ChatHistory.findOne({
      documentId: document._id,
      userId: req.user._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        documentId: document._id,
        userId: req.user._id,
        messages: [],
      });
    }

    const service = await getAiService(userKey.provider);
    const result = await service.chatWithContext(userQuestion, relevantChunk, userKey.apiKey);

    const response = result.data || result;
    const usage = result.usage || {};

    chatHistory.messages.push(
      {
        role: "user",
        content: userQuestion,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: response,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      }
    );

    await chatHistory.save();
    await logUsage(req.user._id, userKey.provider, "chat", usage);

    res.status(200).json({
      success: true,
      data: {
        question: userQuestion,
        answer: response,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id,
      },
      statusCode: 200,
      message: "Chat successful",
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────── Explain Concept ────────────────
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, error: "Document ID is required" });
    }

    const userKey = await getUserApiKey(req.user._id);
    if (!userKey) {
      return noApiKeyError(res);
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    const relevantChunk = findRelevantChunk(document.chunks, concept, 3);
    const chunkIndices = relevantChunk.map((chunk) => chunk.chunkIndex);

    const service = await getAiService(userKey.provider);
    const result = await service.explainConcept(concept, relevantChunk, userKey.apiKey);

    const explanation = result.data || result;
    const usage = result.usage || {};

    await logUsage(req.user._id, userKey.provider, "explain-concept", usage);

    res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: chunkIndices,
      },
      statusCode: 200,
      message: "Concept explained successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────── Chat History ────────────────
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({ success: false, error: "Document ID is required" });
    }

    const chatHistory = await ChatHistory.findOne({
      documentId: documentId,
      userId: req.user._id,
    });

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [],
        statusCode: 200,
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory.messages,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
