import express from "express";
import {
  createSession,
  getSessions,
  chatInSession,
  deleteSession,
} from "../controllers/studySessionController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();
router.use(protect);

router.post("/", createSession);
router.get("/", getSessions);
router.post("/:id/chat", chatInSession);
router.delete("/:id", deleteSession);

export default router;
