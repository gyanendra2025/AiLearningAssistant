import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String, // FIX
      required: [true, "please provide a document title"], // FIX
      trim: true,
    },
    fileName: {
      type: String, // FIX
      required: true,
    },
    filePath: {
      type: String, // FIX
      required: true,
    },
    fileSize: {
      type: String, // FIX
      required: true,
    },
    extractedText: {
      type: String, // FIX
      default: "",
    },
    chunks: [
      {
        content: {
          type: String, // FIX
          required: true,
        },
        pageNumber: {
          type: Number,
          default: 0, // FIX
        },
        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],
    uploadedDate: {
      type: Date, // FIX
      default: Date.now,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String, // FIX
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1, createdAt: -1 }); // FIX

const Document = mongoose.model("Document", documentSchema); // FIX
export default Document;
