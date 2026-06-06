/* ==========================================================================
   NatureSip Pre-order & Checkout Controller
   ========================================================================== */
import { query } from '../config/db.js';
import { createCheckoutSession, createCartCheckoutSession } from '../services/paymentService.js';
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

/**
 * @desc    Checkout the shopping cart items and initiate Stripe/Mock checkout session
 * @route   POST /api/orders/checkout
 * @access  Private (JWT Auth)
 */
export const checkoutCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, shipping_address_id } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email address are required fields.'
      });
    }

    // 1. Fetch active cart
    const cartResult = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Your shopping cart is empty.'
      });
    }
    const cart = cartResult.rows[0];

    // 2. Fetch cart items with product details
    const itemsSql = `
      SELECT ci.*, p.name as product_name, p.price, p.sku
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `;
    const itemsResult = await query(itemsSql, [cart.id]);
    if (itemsResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Your shopping cart is empty.'
      });
    }

    // 3. Verify stock levels for standard products
    for (const item of itemsResult.rows) {
      if (item.product_id) {
        const inventoryResult = await query('SELECT stock_quantity FROM inventory WHERE product_id = $1', [item.product_id]);
        if (inventoryResult.rows.length === 0) {
          return res.status(404).json({
            status: 'error',
            message: `Inventory records for product '${item.product_name}' are missing.`
          });
        }
        const inventory = inventoryResult.rows[0];
        if (inventory.stock_quantity < item.quantity) {
          return res.status(400).json({
            status: 'error',
            message: `Insufficient stock for '${item.product_name}'. Only ${inventory.stock_quantity} units available.`
          });
        }
      }
    }

    // 4. Calculate total amounts
    let subtotal = 0;
    const lineItems = itemsResult.rows.map(item => {
      const price = parseFloat(item.price || 29.99);
      const qty = item.quantity;
      subtotal += price * qty;
      return {
        name: item.product_name || 'NatureSip Custom Blend',
        sku: item.sku || 'NS-CUSTOM',
        price,
        quantity: qty
      };
    });

    const shipping = 0.00;
    const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% sales tax
    const totalAmount = subtotal + shipping + tax;

    // 5. Insert order as pending
    const flavorPreference = itemsResult.rows[0].sku || 'NS-CUSTOM';
    const insertOrderSql = `
      INSERT INTO orders (user_id, name, email, flavor_preference, status, subtotal, tax, shipping, total_amount, shipping_address_id)
      VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const newOrderResult = await query(insertOrderSql, [
      userId,
      name,
      email.toLowerCase().trim(),
      flavorPreference,
      subtotal,
      tax,
      shipping,
      totalAmount,
      shipping_address_id || null
    ]);
    const newOrder = newOrderResult.rows[0];

    // 6. Insert items into order_items
    for (const item of itemsResult.rows) {
      const insertOrderItemSql = `
        INSERT INTO order_items (order_id, product_id, custom_juice_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await query(insertOrderItemSql, [
        newOrder.id,
        item.product_id,
        item.custom_juice_id,
        item.quantity,
        parseFloat(item.price || 29.99)
      ]);
    }

    // 7. Clear the cart
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

    // 8. Create Stripe Checkout Session
    const successUrl = process.env.CHECKOUT_SUCCESS_URL || 'http://localhost:3000/index.html';
    const cancelUrl = process.env.CHECKOUT_CANCEL_URL || 'http://localhost:3000/index.html';

    const session = await createCartCheckoutSession(newOrder, lineItems, successUrl, cancelUrl);

    logger.info(`Cart Checkout session created for order ID: ${newOrder.id}. URL: ${session.url}`);

    res.status(201).json({
      status: 'success',
      message: 'Cart Checkout order created. Redirecting to payment portal...',
      order_id: newOrder.id,
      checkout_url: session.url,
      is_mock: session.isMock
    });

  } catch (err) {
    next(err);
  }
};
