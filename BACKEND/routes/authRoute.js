import express from "express";
import { body } from "express-validator";

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import protect from "../middlewares/auth.js"; // FIX

const router = express.Router();

/* Register validation */
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
];

/* Login validation */
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("please provide a valid email"),
  body("password").notEmpty().withMessage("password is required"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
