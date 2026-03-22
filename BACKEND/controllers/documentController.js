import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromFile } from "../utils/fileParser.js";
import { chunkText } from "../utils/textChunker.js";
import { generateEmbedding } from "../utils/embeddingService.js";
import ApiKey from "../models/ApiKey.js";
import { decrypt } from "../utils/encryption.js";

import fs from "fs/promises";
import mongoose from "mongoose";
export const uploadDocument = async (req, res, next) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a file",
        statusCode: 400,
      });
    }

    const { title } = req.body;

    // Validate title
    if (!title) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    const baseUrl = `http://localhost:${process.env.PORT || 5001}`;
    const fileUrl = `${baseUrl}/upload/documents/${req.file.filename}`;

    // Create document record
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing",
    });

    // Process document in background (non-blocking)
    processDocument(document._id, req.file.path, req.file.originalname).catch((err) => {
      console.error("Document processing error:", err);
    });

    return res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing started.",
    });
  } catch (error) {
    // Cleanup file if error occurs
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// helper function to process any supported file type
const processDocument = async (documentId, filePath, originalName) => {
  try {
    const { text } = await extractTextFromFile(filePath, originalName);

    const chunks = chunkText(text, 500, 50);

    // Try to generate embeddings for each chunk
    try {
      const doc = await Document.findById(documentId);
      let apiKey = process.env.GEMINI_API_KEY;
      let provider = "gemini";

      // Try to get user's API key
      if (doc?.userId) {
        const userKey = await ApiKey.findOne({ userId: doc.userId, isActive: true });
        if (userKey) {
          apiKey = decrypt(userKey.encryptedKey);
          provider = userKey.provider;
        }
      }

      if (apiKey) {
        for (const chunk of chunks) {
          try {
            chunk.embedding = await generateEmbedding(chunk.content, provider, apiKey);
          } catch (embErr) {
            console.warn(`Embedding failed for chunk ${chunk.chunkIndex}:`, embErr.message);
            chunk.embedding = [];
          }
        }
      }
    } catch (embError) {
      console.warn("Embedding generation skipped:", embError.message);
    }

    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });
    console.log(`Document ${documentId} processed successfully`);
  } catch (err) {
    console.error(`Error processing document ${documentId}:`, err);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// private access
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizSets",
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizSets: 0,
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);
    res.status(200).json({
      success: true,
      data: documents,
      count: documents.length,
      message: "Documents fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

// private access
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }
    const flashcardcount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizcount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    document.lastAccessed = Date.now();
    await document.save();

    const documentDate = document.toObject();
    documentDate.flashcardcount = flashcardcount;
    documentDate.quizcount = quizcount;
    res.status(200).json({
      success: true,
      data: documentDate,
      message: "Document fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

// private access
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }
    await fs.unlink(document.filePath).catch(() => {});
    await document.deleteOne();
    res.status(200).json({
      success: true,
      data: null,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// private access
// export const updateDocument = async (req, res, next) => {
//   try {
//   } catch (error) {
//     next(error);
//   }
// };
