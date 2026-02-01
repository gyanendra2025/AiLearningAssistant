import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";

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

    // Process PDF in background (non-blocking)
    processPDF(document._id, req.file.path).catch((err) => {
      console.error("PDF processing error:", err);
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

// helper function processPDF
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

    const chunks = chunkText(text, 500, 50);

    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });
    console.log(`Document ${documentId} processed succesfully`);
  } catch (err) {
    console.error(`Error processsing document ${documentId}:`, err);
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
    document.lastAccessedAt = Date.now();
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
