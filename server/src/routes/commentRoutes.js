import express from "express";
import { getComments, createComment, updateComment, deleteComment } from "../controllers/commentController.js";

const router = express.Router();

router.get("/", getComments);
router.post("/create", createComment);
router.put("/update/:id", updateComment);
router.delete("/delete/:id", deleteComment);

export default router