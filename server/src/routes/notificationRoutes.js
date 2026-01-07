import express from "express";
import { getNotifications, createNotification, deleteNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.post("/create", createNotification);
router.delete("/delete/:id", deleteNotification);

export default router;