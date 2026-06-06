/* ==========================================================================
   NatureSip Wellness Quiz Results API Routes Mapping
   ========================================================================== */
import express from 'express';
import { saveQuizResult, getQuizResults } from '../controllers/quizController.js';
import { optionalProtect, protect } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.post('/results', optionalProtect, saveQuizResult);
router.get('/results', protect, getQuizResults);


export default router;
