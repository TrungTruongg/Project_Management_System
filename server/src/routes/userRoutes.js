import express from "express";
import {
  getUsers,
  updateUser,
  requestEmailChange,
  verifyEmailChange,
  sendAdminResetPasswordLink,
  requestSetPasswordForGoogleAuth,
  verifyAndSetPasswordForGoogleAuth
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.put("/update/:id", updateUser);

router.post("/request-email-change", requestEmailChange);
router.post("/verify-email-change", verifyEmailChange);
router.post("/send-reset-link", sendAdminResetPasswordLink);

router.post("/request-set-password", requestSetPasswordForGoogleAuth);
router.post("/verify-set-password", verifyAndSetPasswordForGoogleAuth);

export default router;