import express from "express";
import {
  createGroup,
  getGroups,
  getGroup,
  joinGroup,
  shareContent,
  leaveGroup,
} from "../controllers/groupController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();
router.use(protect);

router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:id", getGroup);
router.post("/join/:inviteCode", joinGroup);
router.post("/:id/share", shareContent);
router.delete("/:id/leave", leaveGroup);

export default router;
