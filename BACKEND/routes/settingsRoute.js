import express from "express";
import {
  saveApiKey,
  getApiKeys,
  deleteApiKey,
  activateApiKey,
  getUsageHistory,
  getUsageSummary,
} from "../controllers/apiKeyController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

// API Key management
router.post("/api-key", saveApiKey);
router.get("/api-keys", getApiKeys);
router.delete("/api-key/:id", deleteApiKey);
router.put("/api-key/:id/activate", activateApiKey);

// Usage stats
router.get("/usage", getUsageHistory);
router.get("/usage/summary", getUsageSummary);

export default router;
