import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
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
    encryptedKey: {
      type: String,
      required: true,
    },
    maskedKey: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Only one active key per provider per user
apiKeySchema.index({ userId: 1, provider: 1 });

const ApiKey =
  mongoose.models.ApiKey || mongoose.model("ApiKey", apiKeySchema);
export default ApiKey;
