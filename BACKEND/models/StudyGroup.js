import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    inviteCode: {
      type: String,
      unique: true,
      required: true,
    },
    sharedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    sharedFlashcards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flashcard",
      },
    ],
    sharedQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
  },
  { timestamps: true }
);

studyGroupSchema.index({ inviteCode: 1 });
studyGroupSchema.index({ "members.userId": 1 });

const StudyGroup =
  mongoose.models.StudyGroup || mongoose.model("StudyGroup", studyGroupSchema);
export default StudyGroup;
