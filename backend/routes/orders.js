/* ==========================================================================
   NatureSip Pre-order API Routes Mapping
   ========================================================================== */
import express from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.post('/', optionalProtect, createOrder);
router.get('/', protect, getUserOrders);

export default router;
