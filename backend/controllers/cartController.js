/* ==========================================================================
   NatureSip Shopping Cart Controller & Arithmetic Coordinator
   ========================================================================== */
import { query } from '../config/db.js';

/**
 * Helper to fetch or dynamically create a cart for the user
 */
const getOrCreateCart = async (userId) => {
  let cartResult = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (cartResult.rows.length === 0) {
    cartResult = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
  }
  return cartResult.rows[0];
};

/**
 * @desc    Get the active user's shopping cart list, subtotal, and item count
 * @route   GET /api/cart
 * @access  Private (JWT Auth)
 */
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);
    
    // Fetch items with joined product prices, names, images, and custom juice details
    const itemsSql = `
      SELECT ci.*, p.name, p.price, p.sku, p.image_url, cj.blend_name 
      FROM cart_items ci 
      LEFT JOIN products p ON ci.product_id = p.id 
      LEFT JOIN custom_juices cj ON ci.custom_juice_id = cj.id 
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at ASC
    `;
    const itemsResult = await query(itemsSql, [cart.id]);
    
    // Calculate subtotal and total items
    let subtotal = 0;
    let total_items = 0;
    
    const items = itemsResult.rows.map(item => {
      const price = parseFloat(item.price || 0);
      const qty = parseInt(item.quantity || 0);
      subtotal += price * qty;
      total_items += qty;
      return {
        ...item,
        price,
        quantity: qty
      };
    });
    
    res.status(200).json({
      status: 'success',
      cart: {
        id: cart.id,
        user_id: cart.user_id,
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        total_items
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a product or custom juice blend to the user's cart
 * @route   POST /api/cart
 * @access  Private (JWT Auth)
 */
export const addToCart = async (req, res, next) => {
  try {
    const { product_id, custom_juice_id, quantity } = req.body;
    const qty = parseInt(quantity || 1);
    
    // 1. Prevent quantity less than 1
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be a positive integer of 1 or more.'
      });
    }
    
    let productId = product_id || null;
    let customJuiceId = custom_juice_id || null;
    
    if (!productId && !customJuiceId) {
      return res.status(400).json({
        status: 'error',
        message: 'Either a standard product_id or custom_juice_id is required.'
      });
    }
    
    let maxStock = 999;
    
    if (productId) {
      // 2. Verify product exists
      const productResult = await query('SELECT id FROM products WHERE id = $1 AND is_active = true', [productId]);
      if (productResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'The requested product does not exist or is inactive.'
        });
      }
      
      // 3. Retrieve stock limit
      const inventoryResult = await query('SELECT stock_quantity FROM inventory WHERE product_id = $1', [productId]);
      maxStock = inventoryResult.rows.length > 0 ? inventoryResult.rows[0].stock_quantity : 0;
    } else if (customJuiceId) {
      // Verify custom juice ownership
      const juiceResult = await query('SELECT id FROM custom_juices WHERE id = $1 AND user_id = $2', [customJuiceId, req.user.id]);
      if (juiceResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'The requested custom juice recipe is not found on your profile.'
        });
      }
      maxStock = 500; // virtual ceiling for custom batch orders
    }
    
    const cart = await getOrCreateCart(req.user.id);
    
    // Check if the item already exists in the cart to increment quantity
    let searchSql = 'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2';
    let searchParams = [cart.id, productId];
    
    if (customJuiceId) {
      searchSql = 'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND custom_juice_id = $2';
      searchParams = [cart.id, customJuiceId];
    }
    
    const existingResult = await query(searchSql, searchParams);
    
    if (existingResult.rows.length > 0) {
      const existingItem = existingResult.rows[0];
      const newQty = existingItem.quantity + qty;
      
      // 4. Validate stock thresholds
      if (newQty > maxStock) {
        return res.status(400).json({
          status: 'error',
          message: `Cannot add more. Only ${maxStock} units available for this item, and you already have ${existingItem.quantity} in your cart.`
        });
      }
      
      const updateResult = await query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
        [newQty, existingItem.id]
      );
      
      res.status(200).json({
        status: 'success',
        message: 'Cart item quantity updated successfully.',
        item: updateResult.rows[0]
      });
    } else {
      // 4. Validate stock threshold on initial add
      if (qty > maxStock) {
        return res.status(400).json({
          status: 'error',
          message: `Cannot add. Insufficient stock. Only ${maxStock} units are available.`
        });
      }
      
      const insertSql = `
        INSERT INTO cart_items (cart_id, product_id, custom_juice_id, quantity)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const insertResult = await query(insertSql, [cart.id, productId, customJuiceId, qty]);
      
      res.status(201).json({
        status: 'success',
        message: 'Product successfully added to cart.',
        item: insertResult.rows[0]
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update the quantity of an item inside the user's cart
 * @route   PUT /api/cart/:itemId
 * @access  Private (JWT Auth)
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity);
    
    // 1. Prevent quantity less than 1
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be a positive integer of 1 or more.'
      });
    }
    
    // 2. Fetch cart item and join cart owner (security check)
    const itemSql = `
      SELECT ci.*, c.user_id 
      FROM cart_items ci 
      JOIN carts c ON ci.cart_id = c.id 
      WHERE ci.id = $1
    `;
    const itemResult = await query(itemSql, [itemId]);
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found.'
      });
    }
    
    const cartItem = itemResult.rows[0];
    
    // Security check: restrict cross-user alterations
    if (cartItem.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You cannot modify other users carts.'
      });
    }
    
    // 3. Check inventory stock counts
    let maxStock = 999;
    if (cartItem.product_id) {
      const inventoryResult = await query('SELECT stock_quantity FROM inventory WHERE product_id = $1', [cartItem.product_id]);
      maxStock = inventoryResult.rows.length > 0 ? inventoryResult.rows[0].stock_quantity : 0;
    } else if (cartItem.custom_juice_id) {
      maxStock = 500;
    }
    
    if (qty > maxStock) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient stock level. Only ${maxStock} units available for this product.`
      });
    }
    
    const updateResult = await query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [qty, itemId]
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Cart item quantity updated successfully.',
      item: updateResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove an item from the user's cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private (JWT Auth)
 */
export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    
    // Fetch and security check
    const itemSql = `
      SELECT ci.*, c.user_id 
      FROM cart_items ci 
      JOIN carts c ON ci.cart_id = c.id 
      WHERE ci.id = $1
    `;
    const itemResult = await query(itemSql, [itemId]);
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found.'
      });
    }
    
    if (itemResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You cannot modify other users carts.'
      });
    }
    
    await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    
    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Clear all items inside the user's cart
 * @route   DELETE /api/cart
 * @access  Private (JWT Auth)
 */
export const emptyCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    
    res.status(200).json({
      status: 'success',
      message: 'Shopping cart cleared successfully.'
    });
  } catch (err) {
    next(err);
  }
};
