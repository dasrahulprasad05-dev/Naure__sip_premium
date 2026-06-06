/* ==========================================================================
   NatureSip Inventory Controller & Operations Middleware
   ========================================================================== */
import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendLowStockAlert } from '../services/emailService.js';

/**
 * @desc    Middleware to check if requested SKU is active and has sufficient stock
 */
export const checkStockAvailability = async (req, res, next) => {
  try {
    const { sku, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!sku || isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid product SKU and positive quantity are required.'
      });
    }

    // 1. Fetch active product details
    const productSql = 'SELECT * FROM products WHERE sku = $1 AND is_active = true';
    const productResult = await query(productSql, [sku]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Product with SKU '${sku}' does not exist or is currently inactive.`
      });
    }
    const product = productResult.rows[0];

    // 2. Fetch inventory levels
    const inventorySql = 'SELECT * FROM inventory WHERE product_id = $1';
    const inventoryResult = await query(inventorySql, [product.id]);
    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Inventory record not found for the requested product.'
      });
    }
    const inventory = inventoryResult.rows[0];

    // 3. Confirm stock count availability
    if (inventory.stock_quantity < qty) {
      logger.warn(`Insufficient stock for product ${sku}: requested ${qty}, available ${inventory.stock_quantity}`);
      return res.status(400).json({
        status: 'error',
        message: `Insufficient stock. Only ${inventory.stock_quantity} units available for SKU ${sku}.`
      });
    }

    // Attach verified entities to the request body/context
    req.product = product;
    req.inventory = inventory;
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Atomic decrement stock quantity upon checkout completion
 * @param   {string} productId UUID of product
 * @param   {number} quantity Amount to deduct
 * @param   {string} referenceId Order ID reference
 * @returns {Promise<boolean>} Success state of the transaction
 */
export const deductStockAtomically = async (productId, quantity, referenceId) => {
  try {
    // 1. Attempt atomic deduction
    const deductSql = `
      UPDATE inventory 
      SET stock_quantity = stock_quantity - $1 
      WHERE product_id = $2 AND stock_quantity >= $1 
      RETURNING stock_quantity, low_stock_threshold
    `;
    const result = await query(deductSql, [quantity, productId]);

    if (result.rows.length === 0) {
      logger.error(`Failed atomic stock deduction for Product ${productId}. Insufficient stock.`);
      return false;
    }

    const { stock_quantity, low_stock_threshold } = result.rows[0];
    logger.info(`Stock deducted atomically for Product ${productId}. New level: ${stock_quantity}`);

    // 2. Create stock transaction record
    const txSql = `
      INSERT INTO inventory_transactions (product_id, transaction_type, quantity, reference_id)
      VALUES ($1, 'outbound', $2, $3)
    `;
    await query(txSql, [productId, quantity, referenceId]);

    // 3. Perform low stock verification
    if (stock_quantity <= low_stock_threshold) {
      logger.warn(`Product ${productId} stock level (${stock_quantity}) dropped below threshold (${low_stock_threshold})`);
      
      // Fetch product name/sku to construct notification email
      const productResult = await query('SELECT sku, name FROM products WHERE id = $1', [productId]);
      if (productResult.rows.length > 0) {
        const { sku, name } = productResult.rows[0];
        
        // Notify admin in background
        const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'admin@naturesip.com';
        sendLowStockAlert(adminEmail, {
          sku,
          name,
          currentStock: stock_quantity,
          threshold: low_stock_threshold
        }).catch(err => logger.error(`Failed to send low stock notification email: ${err.message}`));
      }
    }

    return true;
  } catch (err) {
    logger.error(`Error in atomic stock deduction: ${err.message}`);
    return false;
  }
};
