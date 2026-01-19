import express from "express";
import { login, register, googleAuth, forgotPassword, verifyResetCode, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/google", googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/password-reset', resetPassword);
router.post("/verify-reset-code", verifyResetCode);

export default router;