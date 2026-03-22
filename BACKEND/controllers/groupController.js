import crypto from "crypto";
import StudyGroup from "../models/StudyGroup.js";

const generateInviteCode = () => crypto.randomBytes(4).toString("hex"); // 8 chars

/**
 * POST /api/groups — Create a study group
 */
export const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: "Group name is required" });
    }

    const group = await StudyGroup.create({
      name,
      description: description || "",
      ownerId: req.user._id,
      inviteCode: generateInviteCode(),
      members: [{ userId: req.user._id, role: "admin" }],
    });

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/groups — List user's groups
 */
export const getGroups = async (req, res, next) => {
  try {
    const groups = await StudyGroup.find({
      "members.userId": req.user._id,
    })
      .populate("ownerId", "username email")
      .populate("sharedDocuments", "title fileName")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/groups/:id — Get group details
 */
export const getGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findOne({
      _id: req.params.id,
      "members.userId": req.user._id,
    })
      .populate("ownerId", "username email")
      .populate("members.userId", "username email")
      .populate("sharedDocuments", "title fileName fileSize uploadedDate")
      .populate("sharedFlashcards", "cards documentId")
      .populate("sharedQuizzes", "title questions");

    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/groups/join/:inviteCode — Join a group
 */
export const joinGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findOne({ inviteCode: req.params.inviteCode });
    if (!group) {
      return res.status(404).json({ success: false, error: "Invalid invite code" });
    }

    // Check if already a member
    const alreadyMember = group.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ success: false, error: "Already a member" });
    }

    group.members.push({ userId: req.user._id, role: "member" });
    await group.save();

    res.status(200).json({ success: true, data: group, message: "Joined group successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/groups/:id/share — Share content with group
 * Body: { type: "document"|"flashcard"|"quiz", contentId }
 */
export const shareContent = async (req, res, next) => {
  try {
    const { type, contentId } = req.body;
    if (!type || !contentId) {
      return res.status(400).json({ success: false, error: "type and contentId are required" });
    }

    const group = await StudyGroup.findOne({
      _id: req.params.id,
      "members.userId": req.user._id,
    });
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const fieldMap = {
      document: "sharedDocuments",
      flashcard: "sharedFlashcards",
      quiz: "sharedQuizzes",
    };
    const field = fieldMap[type];
    if (!field) {
      return res.status(400).json({ success: false, error: "Invalid type. Use document, flashcard, or quiz" });
    }

    // Avoid duplicates
    if (!group[field].includes(contentId)) {
      group[field].push(contentId);
      await group.save();
    }

    res.status(200).json({ success: true, data: group, message: `${type} shared with group` });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/groups/:id/leave — Leave a group
 */
export const leaveGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findOne({
      _id: req.params.id,
      "members.userId": req.user._id,
    });
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    // If owner, delete the group
    if (group.ownerId.toString() === req.user._id.toString()) {
      await group.deleteOne();
      return res.status(200).json({ success: true, message: "Group deleted (you were the owner)" });
    }

    group.members = group.members.filter(
      (m) => m.userId.toString() !== req.user._id.toString()
    );
    await group.save();

    res.status(200).json({ success: true, message: "Left group successfully" });
  } catch (error) {
    next(error);
  }
};
