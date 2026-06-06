/* ==========================================================================
   NatureSip Product Catalog & Stock Controller
   ========================================================================== */
import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * @desc    Get all active products (Admins can fetch inactive ones too)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    // Check if client requested all products (e.g. admin listing page)
    const showAll = req.query.all === 'true';
    
    let sql = `
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock 
      FROM products p 
      LEFT JOIN inventory i ON p.id = i.product_id
    `;
    
    // Non-admins or default calls filter active products only
    if (!showAll) {
      sql += ' WHERE p.is_active = true';
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    const result = await query(sql);
    
    res.status(200).json({
      status: 'success',
      count: result.rows.length,
      products: result.rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single product detail with stock levels
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock 
      FROM products p 
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.'
      });
    }
    
    res.status(200).json({
      status: 'success',
      product: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new product catalog listing and stock count
 * @route   POST /api/products
 * @access  Private (Admin Only)
 */
export const createProduct = async (req, res, next) => {
  try {
    const { sku, name, description, price, stock, image_url, category, flavor, is_active } = req.body;
    
    // 1. Validate required fields
    if (!sku || !name || price === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Product name, SKU code, and unit price are required fields.'
      });
    }
    
    // 2. Validate price > 0
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Product price must be a positive number greater than 0.'
      });
    }
    
    // 3. Validate stock >= 0
    const parsedStock = parseInt(stock !== undefined ? stock : 0);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Inventory stock quantity cannot be negative.'
      });
    }
    
    const cleanSku = sku.trim().toUpperCase();
    
    // 4. Validate duplicate SKU
    const duplicateCheck = await query('SELECT id FROM products WHERE UPPER(sku) = $1', [cleanSku]);
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Product SKU '${cleanSku}' already exists.`
      });
    }
    
    // 5. Insert product details
    const productSql = `
      INSERT INTO products (sku, name, description, price, image_url, category, flavor, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const productParams = [
      cleanSku,
      name.trim(),
      description || '',
      parsedPrice,
      image_url || '',
      category || 'Standard',
      flavor || '',
      is_active !== false
    ];
    
    const productResult = await query(productSql, productParams);
    const newProduct = productResult.rows[0];
    
    // 6. Insert inventory level
    const inventorySql = `
      INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
      VALUES ($1, $2, $3)
    `;
    await query(inventorySql, [newProduct.id, parsedStock, 10]);
    
    logger.info(`Admin created product SKU: ${cleanSku} (Product ID: ${newProduct.id})`);
    
    res.status(201).json({
      status: 'success',
      message: 'Product successfully created.',
      product: {
        ...newProduct,
        stock: parsedStock
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an existing product listing and stock count
 * @route   PUT /api/products/:id
 * @access  Private (Admin Only)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sku, name, description, price, stock, image_url, category, flavor, is_active } = req.body;
    
    // 1. Verify product exists
    const checkProduct = await query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.'
      });
    }
    
    // 2. Validate required fields
    if (!sku || !name || price === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Product name, SKU code, and unit price are required fields.'
      });
    }
    
    // 3. Validate price > 0
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Product price must be a positive number greater than 0.'
      });
    }
    
    // 4. Validate stock >= 0
    const parsedStock = parseInt(stock !== undefined ? stock : 0);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Inventory stock quantity cannot be negative.'
      });
    }
    
    const cleanSku = sku.trim().toUpperCase();
    
    // 5. Validate unique SKU constraint (excluding current product)
    const duplicateCheck = await query('SELECT id FROM products WHERE UPPER(sku) = $1 AND id != $2', [cleanSku, id]);
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Product SKU '${cleanSku}' already exists on another product.`
      });
    }
    
    // 6. Update product fields
    const productSql = `
      UPDATE products 
      SET sku = $1, name = $2, description = $3, price = $4, image_url = $5, category = $6, flavor = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    const productParams = [
      cleanSku,
      name.trim(),
      description || '',
      parsedPrice,
      image_url || '',
      category || 'Standard',
      flavor || '',
      is_active !== false,
      id
    ];
    const productResult = await query(productSql, productParams);
    const updatedProduct = productResult.rows[0];
    
    // 7. Update stock in inventory
    const inventorySql = `
      UPDATE inventory 
      SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $2
    `;
    await query(inventorySql, [parsedStock, id]);
    
    logger.info(`Admin updated product ID: ${id} (SKU: ${cleanSku})`);
    
    res.status(200).json({
      status: 'success',
      message: 'Product successfully updated.',
      product: {
        ...updatedProduct,
        stock: parsedStock
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a product and its associated stock count
 * @route   DELETE /api/products/:id
 * @access  Private (Admin Only)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const checkProduct = await query('SELECT sku FROM products WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.'
      });
    }
    const sku = checkProduct.rows[0].sku;
    
    // Cascade delete handles removing matching inventory rows automatically
    const sql = 'DELETE FROM products WHERE id = $1 RETURNING *';
    await query(sql, [id]);
    
    logger.warn(`Admin deleted product ID: ${id} (SKU: ${sku})`);
    
    res.status(200).json({
      status: 'success',
      message: `Product SKU '${sku}' has been successfully deleted.`
    });
  } catch (err) {
    next(err);
  }
};
