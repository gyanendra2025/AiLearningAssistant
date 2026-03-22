import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ApiUsage from "../models/ApiUsage.js";
import Document from "../models/Document.js";

/**
 * GET /api/analytics/overview — Overall learning stats
 */
export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [docCount, flashcardSets, quizzes] = await Promise.all([
      Document.countDocuments({ userId }),
      Flashcard.find({ userId }),
      Quiz.find({ userId }),
    ]);

    // Count total cards and mastered cards (easeFactor >= 2.5 && consecutiveCorrect >= 3)
    let totalCards = 0, masteredCards = 0, dueCards = 0;
    const now = new Date();
    for (const set of flashcardSets) {
      for (const card of set.cards) {
        totalCards++;
        if (card.consecutiveCorrect >= 3 && card.easeFactor >= 2.5) masteredCards++;
        if (!card.nextReviewDate || new Date(card.nextReviewDate) <= now) dueCards++;
      }
    }

    // Quiz stats
    let totalQuizzes = quizzes.length;
    let avgScore = 0;
    const completedQuizzes = quizzes.filter((q) => q.completedAt || q.score > 0);
    if (completedQuizzes.length > 0) {
      const totalScore = completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0);
      avgScore = Math.round(totalScore / completedQuizzes.length);
    }

    res.status(200).json({
      success: true,
      data: {
        documents: docCount,
        flashcards: { total: totalCards, mastered: masteredCards, due: dueCards, sets: flashcardSets.length },
        quizzes: { total: totalQuizzes, completed: completedQuizzes.length, avgScore },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/study-streak — Daily activity streak
 */
export const getStudyStreak = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Gather all activity dates from flashcard reviews and quiz completions
    const flashcardSets = await Flashcard.find({ userId });
    const quizzes = await Quiz.find({ userId });
    const apiUsage = await ApiUsage.find({ userId });

    const activityDates = new Set();

    // Flashcard review dates
    for (const set of flashcardSets) {
      for (const card of set.cards) {
        if (card.lastReviewed) {
          activityDates.add(new Date(card.lastReviewed).toISOString().split("T")[0]);
        }
      }
    }

    // Quiz dates
    for (const quiz of quizzes) {
      activityDates.add(new Date(quiz.createdAt).toISOString().split("T")[0]);
    }

    // API usage dates
    for (const usage of apiUsage) {
      activityDates.add(new Date(usage.createdAt).toISOString().split("T")[0]);
    }

    // Calculate current streak
    const sortedDates = [...activityDates].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Check if active today or yesterday
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (prev - curr) / 86400000;
        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        currentStreak: streak,
        totalActiveDays: activityDates.size,
        activityDates: [...activityDates].sort(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/quiz-trends?limit=20 — Quiz scores over time
 */
export const getQuizTrends = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const quizzes = await Quiz.find({ userId: req.user._id })
      .populate("documentId", "title")
      .sort({ createdAt: -1 })
      .limit(limit);

    const trends = quizzes.reverse().map((q) => ({
      date: q.createdAt,
      title: q.title || q.documentId?.title || "Quiz",
      score: q.score || 0,
      totalQuestions: q.totalQuestions || q.questions?.length || 0,
      percentage: q.totalQuestions ? Math.round((q.score / q.totalQuestions) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/flashcard-stats — Mastery breakdown
 */
export const getFlashcardStats = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({ userId: req.user._id });

    let newCards = 0, learning = 0, mastered = 0;
    const byDifficulty = { easy: 0, medium: 0, hard: 0 };

    for (const set of flashcardSets) {
      for (const card of set.cards) {
        // Categorize
        if (card.reviewCount === 0) newCards++;
        else if (card.consecutiveCorrect >= 3) mastered++;
        else learning++;

        // By difficulty
        byDifficulty[card.difficulty || "medium"]++;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        newCards,
        learning,
        mastered,
        total: newCards + learning + mastered,
        byDifficulty,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/activity-heatmap?days=90 — Daily activity counts
 */
export const getActivityHeatmap = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const usage = await ApiUsage.find({
      userId: req.user._id,
      createdAt: { $gte: since },
    });

    // Group by date
    const heatmap = {};
    for (const entry of usage) {
      const date = new Date(entry.createdAt).toISOString().split("T")[0];
      heatmap[date] = (heatmap[date] || 0) + 1;
    }

    // Fill missing dates with 0
    const result = [];
    for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      result.push({ date: dateStr, count: heatmap[dateStr] || 0 });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
