import express from "express";
import progressController from "../controllers/progressController.js";
import { verifyJWT } from "../middlewares/auth/auth.js";
import csrfMiddleware, { verifyCsrfToken } from '../middlewares/auth/csrfProtection.js';

const router = express.Router();

// GET PROGRESS
router.get("/", verifyJWT, progressController.getProgress);

// UPDATE PROGRESS
router.put("/update", verifyJWT, verifyCsrfToken, csrfMiddleware, progressController.updateProgress);

export default router;