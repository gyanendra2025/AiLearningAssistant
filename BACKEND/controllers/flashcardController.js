import Flashcard from "../models/Flashcard.js";

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

export const reviewFlashCards = async (req, res, next) => {
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
    flashcardSet.cards[cardIndex].lastReviewed = new Date();
    flashcardSet.cards[cardIndex].reviewCount += 1;
    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
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
