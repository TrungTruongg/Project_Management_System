import express from "express";
import { getProjects, createProject, updateProject, deleteProject } from "../controllers/projectController.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/create", createProject);
router.put("/update/:id", updateProject);
router.delete("/delete/:id", deleteProject);

export default router;