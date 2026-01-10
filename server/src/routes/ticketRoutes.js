import express from "express";
import { getTickets, createTicket, updateTicket, deleteTicket } from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", getTickets);
router.post("/create", createTicket);
router.put("/update/:id", updateTicket);
router.delete("/delete/:id", deleteTicket);

export default router