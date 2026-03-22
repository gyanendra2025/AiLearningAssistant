import mongoose from "mongoose";

const apiUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    provider: {
      type: String,
      required: true,
      enum: ["gemini", "openai"],
    },
    action: {
      type: String,
      required: true,
      enum: [
        "chat",
        "generate-flashcards",
        "generate-quiz",
        "generate-summary",
        "explain-concept",
      ],
    },
    model: {
      type: String,
      default: "",
    },
    inputTokens: {
      type: Number,
      default: 0,
    },
    outputTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

apiUsageSchema.index({ userId: 1, createdAt: -1 });
apiUsageSchema.index({ userId: 1, provider: 1 });

const ApiUsage =
  mongoose.models.ApiUsage || mongoose.model("ApiUsage", apiUsageSchema);
export default ApiUsage;
