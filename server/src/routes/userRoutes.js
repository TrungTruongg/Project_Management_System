import express from "express";
import {
  getUsers,
  updateUser,
  requestEmailChange,
  verifyEmailChange
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.put("/update/:id", updateUser);

router.post("/request-email-change", requestEmailChange);
router.post("/verify-email-change", verifyEmailChange);

export default router;