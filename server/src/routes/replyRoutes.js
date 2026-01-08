import express from "express";
import { getReplies, createReply, updateReply, deleteReply } from "../controllers/replyController.js";

const router = express.Router();

router.get("/", getReplies);
router.post("/create", createReply);
router.put("/update/:id", updateReply);
router.delete("/delete/:id", deleteReply);

export default router