/* ==========================================================================
   NatureSip Product Reviews API Routes Mapping
   ========================================================================== */
import express from 'express';
import { getProductReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public: view product ratings
router.get('/product/:productId', getProductReviews);

// Protected: submit reviews
router.post('/', protect, createReview);

export default router;
