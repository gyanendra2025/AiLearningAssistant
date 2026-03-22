import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      default: "Study Session",
      trim: true,
    },
    documentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    chatHistory: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        sourceDocuments: [
          {
            documentId: mongoose.Schema.Types.ObjectId,
            title: String,
            chunkIndex: Number,
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

studySessionSchema.index({ userId: 1, createdAt: -1 });

const StudySession =
  mongoose.models.StudySession || mongoose.model("StudySession", studySessionSchema);
export default StudySession;
