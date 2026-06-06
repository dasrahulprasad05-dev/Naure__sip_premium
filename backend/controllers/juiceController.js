/* ==========================================================================
   NatureSip Custom Juice Recipes Controller
   ========================================================================== */
import { query } from '../config/db.js';

/**
 * @desc    Save a custom juice blend formula
 * @route   POST /api/custom-juices
 * @access  Private (Authentication Required)
 */
export const saveCustomJuice = async (req, res, next) => {
  try {
    const { blend_name, ingredients, color_rgb } = req.body;

    // Validate inputs
    if (!blend_name || !ingredients || !color_rgb) {
      return res.status(400).json({
        status: 'error',
        message: 'Juice blend name, ingredients, and color code are required parameters.'
      });
    }

    // Insert custom juice record linked to user
    const sql = 'INSERT INTO custom_juices (user_id, blend_name, ingredients, color_rgb) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await query(sql, [
      req.user.id, 
      blend_name, 
      typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients), 
      color_rgb
    ]);
    const newJuice = result.rows[0];

    res.status(201).json({
      status: 'success',
      message: 'Custom juice recipe saved to your profile!',
      custom_juice_id: newJuice.id,
      juice: newJuice
    });

  } catch (err) {
    next(err);
  }
};
