import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, "please provide a title"],
      trim: true,
    },
    questions: [
      {
        questions: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
          validate: [
            (array) => array.length === 4,
            "must have exactly 4 options",
          ],
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          default: "",
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
      },
    ],
    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        selectedAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        answerAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export default Quiz;
