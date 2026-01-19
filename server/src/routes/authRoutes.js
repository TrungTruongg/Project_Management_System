import express from "express";
import { login, register, googleAuth, verifyResetCode, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/google", googleAuth);
// router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-code", verifyResetCode);

export default router;