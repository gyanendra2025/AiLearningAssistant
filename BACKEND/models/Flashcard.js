import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Document",
    },
    cards: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
        lastReviewed: {
          type: Date,
          default: null,
        },
        reviewCount: {
          type: Number,
          default: 0,
        },
        isStarred: {
          type: Boolean,
          default: false,
        },
        // SM-2 Spaced Repetition fields
        easeFactor: {
          type: Number,
          default: 2.5,
        },
        interval: {
          type: Number, // days until next review
          default: 0,
        },
        nextReviewDate: {
          type: Date,
          default: Date.now,
        },
        consecutiveCorrect: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

flashcardSchema.index({ userId: 1, documentId: 1 });

const Flashcard =
  mongoose.models.Flashcard || mongoose.model("Flashcard", flashcardSchema);
export default Flashcard;
