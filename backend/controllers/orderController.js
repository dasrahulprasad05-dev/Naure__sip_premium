/* ==========================================================================
   NatureSip Pre-order & Checkout Controller
   ========================================================================== */
import { query } from '../config/db.js';
import { createCheckoutSession } from '../services/paymentService.js';
import { logger } from '../utils/logger.js';

const MAP_FLAVOR_TO_SKU = {
  'mango': 'NS-MANGO',
  'orange': 'NS-ORANGE',
  'mixed': 'NS-MIXED',
  'pomegranate': 'NS-POM',
  'watermelon': 'NS-WATER',
  'matcha': 'NS-MATCHA',
  'custom': 'NS-CUSTOM'
};

/**
 * @desc    Submit a new juice preorder and initiate Stripe/Mock checkout
 * @route   POST /api/orders
 * @access  Public (Optional User Session integration)
 */
export const createOrder = async (req, res, next) => {
  try {
    const { name, email, flavor_preference, custom_juice_id } = req.body;

    // Validate inputs
    if (!name || !email || !flavor_preference) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email address, and juice preference fields are required.'
      });
    }

    const flavorKey = flavor_preference.toLowerCase().trim();
    const sku = MAP_FLAVOR_TO_SKU[flavorKey] || 'NS-CUSTOM';

    // 1. Fetch product details
    const productSql = 'SELECT * FROM products WHERE sku = $1 AND is_active = true';
    const productResult = await query(productSql, [sku]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Product with SKU '${sku}' is not available.`
      });
    }
    const product = productResult.rows[0];

    // 2. Verify stock levels
    const inventorySql = 'SELECT * FROM inventory WHERE product_id = $1';
    const inventoryResult = await query(inventorySql, [product.id]);
    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Inventory records for this product are currently missing.'
      });
    }
    const inventory = inventoryResult.rows[0];

    const quantity = 1; // Pre-orders default to 1 pack (of 6 bottles)
    if (inventory.stock_quantity < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `The product is currently out of stock. Only ${inventory.stock_quantity} units available.`
      });
    }

    // 3. Optional user authentication association
    const user_id = req.user ? req.user.id : null;

    // 4. Insert order record as pending
    const sql = 'INSERT INTO orders (user_id, name, email, flavor_preference, custom_juice_id, status) VALUES ($1, $2, $3, $4, $5, \'pending\') RETURNING *';
    const result = await query(sql, [user_id, name, email.toLowerCase().trim(), flavor_preference, custom_juice_id || null]);
    const newOrder = result.rows[0];

    // 5. Create checkout session
    // Redirect URLs back to our client portal
    const successUrl = process.env.CHECKOUT_SUCCESS_URL || 'http://localhost:3000/index.html';
    const cancelUrl = process.env.CHECKOUT_CANCEL_URL || 'http://localhost:3000/index.html#preorder';

    const orderDetails = {
      name,
      email: email.toLowerCase().trim(),
      price: parseFloat(product.price),
      quantity,
      sku,
      orderId: newOrder.id
    };

    const session = await createCheckoutSession(orderDetails, successUrl, cancelUrl);

    logger.info(`Checkout session created for order ID: ${newOrder.id}. URL: ${session.url}`);

    res.status(201).json({
      status: 'success',
      message: 'Pre-order created. Redirecting to checkout...',
      order_id: newOrder.id,
      checkout_url: session.url,
      is_mock: session.isMock
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get order history for authenticated user
 * @route   GET /api/orders
 * @access  Private
 */
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Query orders joined with custom juice descriptions
    const sql = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await query(sql, [userId]);

    res.status(200).json({
      status: 'success',
      count: result.rows.length,
      orders: result.rows
    });

  } catch (err) {
    next(err);
  }
};
