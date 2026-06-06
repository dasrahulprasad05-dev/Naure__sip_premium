/* ==========================================================================
   NatureSip Stripe & Simulator Payment Controller
   ========================================================================== */
import { query } from '../config/db.js';
import { deductStockAtomically } from './inventoryController.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { logAudit } from '../utils/logger.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_placeholder', {
  apiVersion: '2023-10-16'
});

// Helper function to process successful payment operations
const processOrderPayment = async (orderId, transactionId, amount, provider, payload = {}) => {
  // 1. Fetch order details
  const orderSql = 'SELECT * FROM orders WHERE id = $1';
  const orderResult = await query(orderSql, [orderId]);
  if (orderResult.rows.length === 0) {
    throw new Error(`Order ${orderId} not found`);
  }
  const order = orderResult.rows[0];

  // If order is already completed, return it (idempotency)
  if (order.status === 'completed') {
    return order;
  }

  // 2. Fetch product details based on flavor preference
  const MAP_FLAVOR_TO_SKU = {
    'mango': 'NS-MANGO',
    'orange': 'NS-ORANGE',
    'mixed': 'NS-MIXED',
    'pomegranate': 'NS-POM',
    'watermelon': 'NS-WATER',
    'matcha': 'NS-MATCHA',
    'custom': 'NS-CUSTOM'
  };
  const sku = MAP_FLAVOR_TO_SKU[order.flavor_preference.toLowerCase()] || 'NS-CUSTOM';
  const productSql = 'SELECT * FROM products WHERE sku = $1';
  const productResult = await query(productSql, [sku]);
  if (productResult.rows.length === 0) {
    throw new Error(`Product SKU ${sku} not found`);
  }
  const product = productResult.rows[0];

  // 3. Update order status to 'completed'
  const updateOrderSql = "UPDATE orders SET status = 'completed' WHERE id = $1 RETURNING *";
  const updatedOrderResult = await query(updateOrderSql, [orderId]);
  const updatedOrder = updatedOrderResult.rows[0];

  // 4. Log payment record in payments table
  const paymentSql = `
    INSERT INTO payments (order_id, provider_transaction_id, amount, currency, status, provider, webhook_payload)
    VALUES ($1, $2, $3, 'usd', 'completed', $4, $5)
    RETURNING *
  `;
  await query(paymentSql, [
    orderId,
    transactionId,
    amount,
    provider,
    JSON.stringify(payload)
  ]);

  // 5. Decrement stock atomically
  let quantity = 1;
  const orderItemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  if (orderItemsResult.rows.length > 0) {
    // For confirmation email, aggregate total item quantities
    quantity = orderItemsResult.rows.reduce((sum, item) => sum + item.quantity, 0);
    for (const item of orderItemsResult.rows) {
      if (item.product_id) {
        await deductStockAtomically(item.product_id, item.quantity, orderId);
      }
    }
  } else {
    const stockDeducted = await deductStockAtomically(product.id, quantity, orderId);
    if (!stockDeducted) {
      console.warn(`⚠️ Stock deduction failed or was skipped during payment processing for order ${orderId}`);
    }
  }


  // 6. Send order confirmation email
  const emailDetails = {
    id: orderId,
    name: order.name,
    sku: sku,
    amount: amount,
    quantity: quantity
  };
  
  sendOrderConfirmationEmail(order.email, emailDetails).catch(err => {
    console.error(`❌ Failed to send order confirmation email to ${order.email}:`, err.message);
  });

  // 7. Log audit record
  logAudit('PREORDER_PAYMENT_SUCCESS', 'orders', order.user_id, {
    orderId,
    transactionId,
    amount,
    sku
  });

  return updatedOrder;
};

/**
 * @desc    Confirm a simulated mock payment from the client redirect
 * @route   POST /api/payments/confirm-mock
 * @access  Public
 */
export const confirmMockPayment = async (req, res, next) => {
  try {
    const { order_id, session_id, sku, email, name, amount } = req.body;

    if (!order_id || !session_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID and Session ID are required for confirmation.'
      });
    }

    const updatedOrder = await processOrderPayment(
      order_id,
      session_id,
      parseFloat(amount || 24.99),
      'stripe_mock',
      req.body
    );

    res.status(200).json({
      status: 'success',
      message: 'Mock payment confirmed and order completed.',
      order: updatedOrder
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify and finalize a Stripe session from success page redirect
 * @route   GET /api/payments/verify-session
 * @access  Public
 */
export const verifyStripeSession = async (req, res, next) => {
  try {
    const { session_id, order_id } = req.query;

    if (!session_id || !order_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID and Order ID query parameters are required.'
      });
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const amount = session.amount_total / 100; // cents to dollars
      const updatedOrder = await processOrderPayment(
        order_id,
        session.payment_intent || session.id,
        amount,
        'stripe',
        session
      );

      return res.status(200).json({
        status: 'success',
        message: 'Stripe payment verification successful.',
        order: updatedOrder
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: `Checkout session has not been completed. Status: ${session.payment_status}`
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Stripe webhook endpoint for handling events in the background
 * @route   POST /api/payments/webhook
 * @access  Public
 */
export const handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (endpointSecret && sig) {
      // Real Stripe Webhook verification
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } else {
      // Mock / signature verification bypass
      event = req.body;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId || session.client_reference_id;
      const amount = session.amount_total / 100;

      if (orderId) {
        await processOrderPayment(
          orderId,
          session.payment_intent || session.id,
          amount,
          'stripe',
          session
        );
      } else {
        console.warn('⚠️ Webhook received checkout.session.completed but no orderId was found in metadata.');
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
