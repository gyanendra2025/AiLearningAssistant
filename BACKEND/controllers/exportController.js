import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import Document from "../models/Document.js";

/**
 * GET /api/export/flashcards/:setId?format=anki|csv|json
 */
export const exportFlashcards = async (req, res, next) => {
  try {
    const format = req.query.format || "csv";
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.setId,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!flashcardSet) {
      return res.status(404).json({ success: false, error: "Flashcard set not found" });
    }

    const cards = flashcardSet.cards;

    if (format === "anki") {
      // Anki tab-separated format
      const content = cards.map((c) => `${c.question}\t${c.answer}`).join("\n");
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="flashcards-anki.txt"`);
      return res.send(content);
    }

    if (format === "csv") {
      const header = "Question,Answer,Difficulty,Review Count,Ease Factor";
      const rows = cards.map((c) =>
        `"${(c.question || "").replace(/"/g, '""')}","${(c.answer || "").replace(/"/g, '""')}","${c.difficulty}",${c.reviewCount},${c.easeFactor}`
      );
      const content = [header, ...rows].join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="flashcards.csv"`);
      return res.send(content);
    }

    // JSON
    res.status(200).json({
      success: true,
      data: {
        title: flashcardSet.documentId?.title || "Flashcards",
        exportDate: new Date().toISOString(),
        count: cards.length,
        cards: cards.map((c) => ({
          question: c.question,
          answer: c.answer,
          difficulty: c.difficulty,
          reviewCount: c.reviewCount,
          easeFactor: c.easeFactor,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/export/quiz/:quizId?format=json|md
 */
export const exportQuiz = async (req, res, next) => {
  try {
    const format = req.query.format || "json";
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    if (format === "md") {
      let md = `# Quiz: ${quiz.title || "Quiz"}\n`;
      md += `**Document:** ${quiz.documentId?.title || "—"}\n`;
      md += `**Date:** ${new Date(quiz.createdAt).toLocaleDateString()}\n`;
      md += `**Score:** ${quiz.score || 0}/${quiz.totalQuestions || quiz.questions?.length || 0}\n\n---\n\n`;

      quiz.questions?.forEach((q, i) => {
        md += `### Q${i + 1}: ${q.questions || q.question || ""}\n\n`;
        q.options?.forEach((opt, j) => {
          const prefix = opt === q.correctAnswer ? "✅" : "  ";
          md += `${prefix} ${j + 1}. ${opt}\n`;
        });
        md += `\n**Correct Answer:** ${q.correctAnswer || ""}\n`;
        if (q.explanation) md += `**Explanation:** ${q.explanation}\n`;
        md += "\n---\n\n";
      });

      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="quiz-results.md"`);
      return res.send(md);
    }

    // JSON
    res.status(200).json({
      success: true,
      data: {
        title: quiz.title,
        document: quiz.documentId?.title,
        exportDate: new Date().toISOString(),
        score: quiz.score,
        totalQuestions: quiz.totalQuestions || quiz.questions?.length,
        questions: quiz.questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/export/document/:id/notes — Export document as study notes
 */
export const exportDocumentNotes = async (req, res, next) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!doc) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    let md = `# Study Notes: ${doc.title}\n\n`;
    md += `**Uploaded:** ${new Date(doc.uploadedDate || doc.createdAt).toLocaleDateString()}\n`;
    md += `**File:** ${doc.fileName}\n\n---\n\n`;

    if (doc.chunks && doc.chunks.length > 0) {
      md += `## Content (${doc.chunks.length} sections)\n\n`;
      doc.chunks.forEach((chunk, i) => {
        md += `### Section ${i + 1}\n\n${chunk.content}\n\n`;
      });
    } else if (doc.extractedText) {
      md += `## Full Text\n\n${doc.extractedText}\n`;
    }

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${doc.title}-notes.md"`);
    res.send(md);
  } catch (error) {
    next(error);
  }
};
