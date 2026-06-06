/* ==========================================================================
   NatureSip Custom Juice Recipes API Routes Mapping
   ========================================================================== */
import express from 'express';
import { saveCustomJuice } from '../controllers/juiceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes (Protected: Sign In Required)
router.post('/', protect, saveCustomJuice);

export default router;
