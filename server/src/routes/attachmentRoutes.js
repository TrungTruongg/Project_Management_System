import express from "express";
import { getAttachments, createAttachment, deleteAttachment, uploadFile, upload } from "../controllers/attachmentController.js";

const router = express.Router();

router.get("/", getAttachments);
router.post("/create", createAttachment);
router.post("/upload", upload.single('file'), uploadFile);
router.delete("/delete/:id", deleteAttachment);

export default router;