import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completeQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null },
    });

    const flashcardSets = await Flashcard.find({ userId });
    let totalflashcards = 0;
    let reviewflashcards = 0;
    let starredflashcards = 0;

    flashcardSets.forEach((set) => {
      totalflashcards += set.cards.length;
      reviewflashcards += set.cards.filter((card) => card.lastReviewed).length;
      starredflashcards += set.cards.filter((card) => card.isStarred).length;
    });

    const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
    const averagescore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length,
          )
        : 0;

    const recentDocument = await Document.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title fileName lastAccessed status");

    const recentQuizzes = await Quiz.find({
      userId,
      completedAt: { $ne: null },
    })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate("documentId", "title")
      .select("title score completedAt");

    const recentFlashcards = await Flashcard.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("cards documentId");

    const studystreak = Math.floor(Math.random() * 7) + 1;

    res.status(200).json({
      success: true,
      data: {
        totalDocuments,
        totalFlashcardSets,
        totalQuizzes,
        completeQuizzes,
        totalflashcards,
        reviewflashcards,
        starredflashcards,
        averagescore,
        studystreak,
      },
      recentActivity: {
        documents: recentDocument,
        quizzes: recentQuizzes,
        flashcards: recentFlashcards,
      },
    });
  } catch (err) {
    next(err);
  }
};
