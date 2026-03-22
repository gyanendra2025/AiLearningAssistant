import express from "express";
import {
  exportFlashcards,
  exportQuiz,
  exportDocumentNotes,
} from "../controllers/exportController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();
router.use(protect);

router.get("/flashcards/:setId", exportFlashcards);
router.get("/quiz/:quizId", exportQuiz);
router.get("/document/:id/notes", exportDocumentNotes);

export default router;
