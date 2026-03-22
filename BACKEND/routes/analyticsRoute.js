import express from "express";
import {
  getOverview,
  getStudyStreak,
  getQuizTrends,
  getFlashcardStats,
  getActivityHeatmap,
} from "../controllers/analyticsController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();
router.use(protect);

router.get("/overview", getOverview);
router.get("/study-streak", getStudyStreak);
router.get("/quiz-trends", getQuizTrends);
router.get("/flashcard-stats", getFlashcardStats);
router.get("/activity-heatmap", getActivityHeatmap);

export default router;
