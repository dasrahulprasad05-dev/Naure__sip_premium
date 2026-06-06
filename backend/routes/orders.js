/* ==========================================================================
   NatureSip Pre-order API Routes Mapping
   ========================================================================== */
import express from 'express';
import { createOrder, getUserOrders, checkoutCart } from '../controllers/orderController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.post('/', optionalProtect, createOrder);
router.post('/checkout', protect, checkoutCart);
router.get('/', protect, getUserOrders);

export default router;
