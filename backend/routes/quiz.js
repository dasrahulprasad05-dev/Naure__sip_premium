/* ==========================================================================
   NatureSip Wellness Quiz Results API Routes Mapping
   ========================================================================== */
import express from 'express';
import { saveQuizResult } from '../controllers/quizController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// Routes (Optional Authentication)
router.post('/results', optionalProtect, saveQuizResult);

export default router;
