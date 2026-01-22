import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

// Import routes
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import attachmentRoutes from "./src/routes/attachmentRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import replyRoutes from "./src/routes/replyRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 6969;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:1234',
    'https://accounts.google.com',
    'https://www.googleapis.com',
    'https://project-management-system-rb5c.onrender.com/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/comments", commentRoutes);
app.use("/api/replies", replyRoutes);
app.use("/api/tickets", ticketRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});