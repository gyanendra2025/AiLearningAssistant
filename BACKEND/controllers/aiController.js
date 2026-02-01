import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunk } from "../utils/textChunker.js";

export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const flashcards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count),
    );

    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: flashcards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });
    res.status(201).json({
      success: true,
      data: flashcardSet,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const questions = await geminiService.generateQuiz(
      document.extractedText,
      parseInt(numQuestions),
    );

    const quizSet = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: `${document.title}-Quiz`,
      questions: questions,
      totalQuestions: questions.length,
      userAnswer: [],
      score: 0,
    });
    res.status(201).json({
      success: true,
      data: quizSet,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const summary = await geminiService.generateSummary(document.extractedText);

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

export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const relevantChunk = await findRelevantChunk(document.chunks, question, 3);
    const chunkIndices = relevantChunk.map((chunk) => chunk.index);

    let chatHistory = await ChatHistory.findOne({
      documentId: document._id,
      userId: req.user._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        documentId: document._id,
        userId: req.user._id,
        chatHistory: [],
      });
    }

    const response = await geminiService.chatWithContext(
      question,
      relevantChunk,
    );

    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: response,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      },
    );

    await chatHistory.save();

    res.status(200).json({
      success: true,
      data: {
        question,
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

export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const relevantChunk = await findRelevantChunk(document.chunks, concept, 3);
    const chunkIndices = relevantChunk.map((chunk) => chunk.index);

    const explanation = await geminiService.explainConcept(
      concept,
      relevantChunk,
    );

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

export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const chatHistory = await ChatHistory.findOne({
      documentId: documentId,
      userId: req.user._id,
    });
    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        error: "Chat history not found",
        statusCode: 404,
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
