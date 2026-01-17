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
          type: [String], // FIX
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
          type: String, // FIX
          default: "",
        },
        difficulty: {
          type: String, // FIX
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
        userAnswer: [
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
        totalQuestion: {
          type: Number,
          default: 0, // FIX (true ❌)
        },
        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.model("Quiz", quizSchema); // FIX
export default Quiz;
