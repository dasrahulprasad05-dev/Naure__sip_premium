/* ==========================================================================
   NatureSip Payments REST API Routes Mapping
   ========================================================================== */
import express from 'express';
import { confirmMockPayment, verifyStripeSession, handleStripeWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// Routes
router.post('/confirm-mock', confirmMockPayment);
router.get('/verify-session', verifyStripeSession);
router.post('/webhook', handleStripeWebhook);

export default router;
