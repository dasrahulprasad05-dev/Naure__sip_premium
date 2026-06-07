/* ==========================================================================
   NatureSip Stripe Payment Service & Integration Coordinator
   ========================================================================== */
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Determine if we should use mock payment mode (fallback if API secret key is missing)
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_placeholder';
const isMockPayment = STRIPE_SECRET.startsWith('sk_test_mock') || !process.env.STRIPE_SECRET_KEY;

let stripe = null;
if (!isMockPayment) {
  stripe = new Stripe(STRIPE_SECRET, {
    apiVersion: '2023-10-16' // Pin to secure Stripe API version
  });
  console.log("💳 Stripe Payment Integration client initialized successfully.");
} else {
  console.warn("⚠️ Operating on Mock Stripe checkout simulation. Secret key missing.");
}

/**
 * @desc    Create a Stripe Checkout Session
 * @param   {Object} orderDetails (name, email, price, quantity, sku)
 * @param   {string} successUrl Redirection target on payment success
 * @param   {string} cancelUrl Redirection target on payment cancellation
 * @returns {Object} Checkout Session Details containing checkout URL
 */
export const createCheckoutSession = async (orderDetails, successUrl, cancelUrl) => {
  const { name, email, price, quantity, sku, orderId } = orderDetails;
  
  if (isMockPayment) {
    const mockSessionId = `cs_mock_${Date.now()}`;
    console.log(`[Stripe Mock] Created mock checkout session ${mockSessionId} for ${email}`);
    
    // Return mock session redirecting directly to checkout success trigger
    return {
      id: mockSessionId,
      url: `${successUrl}?session_id=${mockSessionId}&mock=true&sku=${sku}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&amount=${price * quantity}&order_id=${orderId}`,
      isMock: true
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: name,
              metadata: { sku }
            },
            unit_amount: Math.round(price * 100), // Stripe expects amounts in cents
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: cancelUrl,
      metadata: { sku, orderId }
    });

    return { id: session.id, url: session.url, isMock: false };
  } catch (err) {
    console.error("❌ Stripe Checkout Session creation failed:", err.message);
    throw err;
  }
};

/**
 * @desc    Create a Stripe Checkout Session for a multi-item cart order
 */
export const createCartCheckoutSession = async (order, lineItems, successUrl, cancelUrl) => {
  const { name, email, total_amount, id: orderId } = order;

  if (isMockPayment) {
    const mockSessionId = `cs_mock_${Date.now()}`;
    console.log(`[Stripe Mock] Created cart checkout session ${mockSessionId} for ${email}`);
    return {
      id: mockSessionId,
      url: `${successUrl}?session_id=${mockSessionId}&mock=true&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&amount=${total_amount}&order_id=${orderId}`,
      isMock: true
    };
  }

  try {
    const stripeLineItems = lineItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: { sku: item.sku }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add tax if configured
    if (parseFloat(order.tax) > 0) {
      stripeLineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Estimated Sales Tax'
          },
          unit_amount: Math.round(parseFloat(order.tax) * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      mode: 'payment',
      customer_email: email,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: cancelUrl,
      metadata: { orderId }
    });

    return { id: session.id, url: session.url, isMock: false };
  } catch (err) {
    console.error("❌ Stripe Cart Checkout Session creation failed:", err.message);
    throw err;
  }
};

/**
 * @desc    Process refund on payment transaction
 * @param   {string} paymentIntentId Stripe Payment Intent ID
 * @param   {number} amount Refund amount in USD
 * @returns {Object} Refund transaction status
 */
export const refundPayment = async (paymentIntentId, amount) => {
  if (isMockPayment || paymentIntentId.startsWith('pi_mock')) {
    console.log(`[Stripe Mock] Executing mock refund of $${amount} on ID ${paymentIntentId}`);
    return { status: 'succeeded', refundId: `re_mock_${Date.now()}`, isMock: true };
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100) // cents
    });
    return { status: refund.status, refundId: refund.id, isMock: false };
  } catch (err) {
    console.error("❌ Stripe Refund request failed:", err.message);
    throw err;
  }
};

/**
 * @desc    Verify Stripe webhook signature
 * @param   {Buffer} rawBody Unparsed request body stream
 * @param   {string} sigHeader Stripe signature header
 * @param   {string} webhookSecret Webhook constructed secret
 * @returns {Object} Parsed Stripe Event
 */
export const verifyWebhookSignature = (rawBody, sigHeader, webhookSecret) => {
  if (isMockPayment) {
    // If running in mock database mode, allow constructEvent bypass for testing
    const parsedPayload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    return parsedPayload;
  }
  return stripe.webhooks.constructEvent(rawBody, sigHeader, webhookSecret);
};

export const isPaymentMockEnabled = () => isMockPayment;
