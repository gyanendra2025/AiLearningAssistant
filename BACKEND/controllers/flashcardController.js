import Flashcard from "../models/Flashcard.js";
import { calculateNextReview, sortByReviewPriority } from "../utils/spacedRepetition.js";

export const getFlashCards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title filename")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: flashcards.length,
      flashcards,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFlashCardsSets = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({ userId: req.user._id })
      .populate("documentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      flashcardSets,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review a flashcard with SM-2 quality rating.
 * Body: { cardId, quality } — quality is 1-5
 */
export const reviewFlashCards = async (req, res, next) => {
  try {
    const { cardId, quality } = req.body;
    const q = parseInt(quality) || 3;

    const flashcardSet = await Flashcard.findOne({
      _id: req.params.cardId,
      userId: req.user._id,
    });
    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
        statusCode: 404,
      });
    }

    // Find the specific card by subdocument ID
    const targetId = cardId || req.params.cardId;
    const card = flashcardSet.cards.id(targetId);
    if (!card) {
      // If cardId doesn't match a subdoc, try treating cardId as the set-level review
      // and review the first unreview card or just update reviewCount
      return res.status(404).json({
        success: false,
        error: "Card not found in this set",
        statusCode: 404,
      });
    }

    // Apply SM-2
    const result = calculateNextReview(
      q,
      card.easeFactor,
      card.interval,
      card.consecutiveCorrect
    );

    card.easeFactor = result.newEaseFactor;
    card.interval = result.newInterval;
    card.nextReviewDate = result.nextReviewDate;
    card.consecutiveCorrect = result.consecutiveCorrect;
    card.lastReviewed = new Date();
    card.reviewCount += 1;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: {
        card,
        nextReview: {
          interval: result.newInterval,
          nextReviewDate: result.nextReviewDate,
          easeFactor: result.newEaseFactor,
        },
      },
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /flashcard/:id/due — Get cards due for review in a flashcard set
 */
export const getDueCards = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
        statusCode: 404,
      });
    }

    const now = new Date();
    const dueCards = flashcardSet.cards.filter(
      (card) => !card.nextReviewDate || new Date(card.nextReviewDate) <= now
    );

    const sorted = sortByReviewPriority(dueCards);

    res.status(200).json({
      success: true,
      data: {
        setId: flashcardSet._id,
        documentTitle: flashcardSet.documentId?.title,
        totalCards: flashcardSet.cards.length,
        dueCount: sorted.length,
        cards: sorted,
      },
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.cardId,
      userId: req.user._id,
    });
    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard not found",
        statusCode: 404,
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card) => card._id.toString() === req.params.cardId,
    );
    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Flashcard not found",
        statusCode: 404,
      });
    }
    flashcardSet.cards[cardIndex].isStarred =
      !flashcardSet.cards[cardIndex].isStarred;
    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? "unstarred" : "starred"}`,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashCardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard not found",
        statusCode: 404,
      });
    }
    await flashcardSet.deleteOne();
    res.status(200).json({
      success: true,
      message: "Flashcard deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
