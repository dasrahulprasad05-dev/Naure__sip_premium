/* ==========================================================================
   NatureSip Address Book Controller
   ========================================================================== */
import { query } from '../config/db.js';

/**
 * @desc    Get saved shipping & billing addresses for the current user
 * @route   GET /api/addresses
 * @access  Private (JWT Auth)
 */
export const getAddresses = async (req, res, next) => {
  try {
    const sql = 'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await query(sql, [req.user.id]);
    
    res.status(200).json({
      status: 'success',
      count: result.rows.length,
      addresses: result.rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Save a new billing or shipping address
 * @route   POST /api/addresses
 * @access  Private (JWT Auth)
 */
export const createAddress = async (req, res, next) => {
  try {
    const { street, city, state, postal_code, country, address_type, is_default } = req.body;
    
    if (!street || !city || !state || !postal_code || !country || !address_type) {
      return res.status(400).json({
        status: 'error',
        message: 'Street, city, state, postal code, country, and address type are required.'
      });
    }

    const type = address_type.toLowerCase() === 'billing' ? 'billing' : 'shipping';
    const isDefault = is_default === true;

    // If setting as default, clear default status on other addresses of the same type
    if (isDefault) {
      await query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1 AND address_type = $2',
        [req.user.id, type]
      );
    }

    const sql = `
      INSERT INTO addresses (user_id, street, city, state, postal_code, country, address_type, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await query(sql, [
      req.user.id,
      street,
      city,
      state,
      postal_code,
      country,
      type,
      isDefault
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Address saved successfully.',
      address: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a saved address details
 * @route   PUT /api/addresses/:id
 * @access  Private (JWT Auth)
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { street, city, state, postal_code, country, address_type, is_default } = req.body;

    // Verify ownership
    const checkSql = 'SELECT * FROM addresses WHERE id = $1 AND user_id = $2';
    const checkResult = await query(checkSql, [id, req.user.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found or unauthorized.'
      });
    }

    const existing = checkResult.rows[0];
    const type = address_type ? (address_type.toLowerCase() === 'billing' ? 'billing' : 'shipping') : existing.address_type;
    const isDefault = is_default !== undefined ? (is_default === true) : existing.is_default;

    if (isDefault && !existing.is_default) {
      await query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1 AND address_type = $2',
        [req.user.id, type]
      );
    }

    const sql = `
      UPDATE addresses 
      SET street = $1, city = $2, state = $3, postal_code = $4, country = $5, address_type = $6, is_default = $7
      WHERE id = $8 AND user_id = $9
      RETURNING *
    `;
    const result = await query(sql, [
      street || existing.street,
      city || existing.city,
      state || existing.state,
      postal_code || existing.postal_code,
      country || existing.country,
      type,
      isDefault,
      id,
      req.user.id
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Address updated successfully.',
      address: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a saved address
 * @route   DELETE /api/addresses/:id
 * @access  Private (JWT Auth)
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const checkSql = 'SELECT id FROM addresses WHERE id = $1 AND user_id = $2';
    const checkResult = await query(checkSql, [id, req.user.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found or unauthorized.'
      });
    }

    await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, req.user.id]);

    res.status(200).json({
      status: 'success',
      message: 'Address deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
