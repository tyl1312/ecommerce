import express from "express";
import progressController from "../controllers/progressController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET PROGRESS
router.get("/", authenticateToken, progressController.getProgress);

// UPDATE PROGRESS
router.put("/update", authenticateToken, progressController.updateProgress);

export default router;