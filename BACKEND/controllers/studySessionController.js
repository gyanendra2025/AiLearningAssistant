import StudySession from "../models/StudySession.js";
import Document from "../models/Document.js";
import ApiKey from "../models/ApiKey.js";
import { decrypt } from "../utils/encryption.js";
import { getAiService } from "../utils/aiProviderFactory.js";
import { generateEmbedding, findRelevantChunksByEmbedding } from "../utils/embeddingService.js";

/**
 * POST /api/study-session — Create a new multi-doc study session
 */
export const createSession = async (req, res, next) => {
  try {
    const { title, documentIds } = req.body;

    if (!documentIds || documentIds.length < 1) {
      return res.status(400).json({ success: false, error: "Select at least 1 document" });
    }
    if (documentIds.length > 5) {
      return res.status(400).json({ success: false, error: "Maximum 5 documents per session" });
    }

    // Verify docs belong to user
    const docs = await Document.find({ _id: { $in: documentIds }, userId: req.user._id });
    if (docs.length !== documentIds.length) {
      return res.status(400).json({ success: false, error: "Some documents not found" });
    }

    const session = await StudySession.create({
      userId: req.user._id,
      title: title || `Study Session — ${docs.map((d) => d.title).join(", ")}`,
      documentIds,
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/study-session — List all sessions
 */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id })
      .populate("documentIds", "title fileName")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/study-session/:id/chat — Chat across multiple documents
 */
export const chatInSession = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const session = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    // Get all documents' chunks
    const docs = await Document.find({ _id: { $in: session.documentIds } });
    const allChunks = [];
    for (const doc of docs) {
      for (const chunk of doc.chunks) {
        allChunks.push({
          ...chunk.toObject(),
          documentId: doc._id,
          documentTitle: doc.title,
        });
      }
    }

    // Find relevant chunks using embedding similarity
    let relevantChunks;
    const hasEmbeddings = allChunks.some((c) => c.embedding && c.embedding.length > 0);

    if (hasEmbeddings) {
      try {
        const activeKey = await ApiKey.findOne({ userId: req.user._id, isActive: true });
        if (!activeKey) {
          return res.status(403).json({
            success: false,
            error: "No API key configured. Please add your API key in Settings first.",
            code: "API_KEY_REQUIRED",
          });
        }
        const apiKey = decrypt(activeKey.encryptedKey);
        const provider = activeKey.provider;

        const questionEmb = await generateEmbedding(message, provider, apiKey);
        relevantChunks = findRelevantChunksByEmbedding(allChunks, questionEmb, 5);
      } catch {
        relevantChunks = allChunks.slice(0, 5);
      }
    } else {
      // Keyword-based fallback
      const lower = message.toLowerCase();
      relevantChunks = allChunks
        .filter((c) => c.content.toLowerCase().includes(lower.split(" ")[0]))
        .slice(0, 5);
      if (relevantChunks.length === 0) relevantChunks = allChunks.slice(0, 5);
    }

    // Build context from multiple docs
    const context = relevantChunks
      .map((c) => `[From: ${c.documentTitle}]\n${c.content}`)
      .join("\n\n---\n\n");

    // Get AI service
    const activeKey = await ApiKey.findOne({ userId: req.user._id, isActive: true });
    if (!activeKey) {
      return res.status(403).json({
        success: false,
        error: "No API key configured. Please add your API key in Settings first.",
        code: "API_KEY_REQUIRED",
      });
    }
    const apiKey = decrypt(activeKey.encryptedKey);
    const provider = activeKey.provider;
    const aiService = getAiService(provider);

    const result = await aiService.chatWithContext(context, message, [], apiKey);

    // Save to session chat history
    session.chatHistory.push(
      { role: "user", content: message },
      {
        role: "assistant",
        content: result.answer || result,
        sourceDocuments: relevantChunks.map((c) => ({
          documentId: c.documentId,
          title: c.documentTitle,
          chunkIndex: c.chunkIndex,
        })),
      }
    );
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        answer: result.answer || result,
        sources: relevantChunks.map((c) => ({
          document: c.documentTitle,
          chunkIndex: c.chunkIndex,
          preview: c.content.substring(0, 100) + "...",
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/study-session/:id
 */
export const deleteSession = async (req, res, next) => {
  try {
    await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    next(error);
  }
};
