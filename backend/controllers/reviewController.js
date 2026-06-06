/* ==========================================================================
   NatureSip Product Reviews Controller
   ========================================================================== */
import { query } from '../config/db.js';

/**
 * @desc    Get reviews and ratings list for a single product catalog item
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const sql = `
      SELECT r.*, u.name as reviewer_name 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = $1 
      ORDER BY r.created_at DESC
    `;
    const result = await query(sql, [productId]);

    // Calculate average rating
    let averageRating = 0;
    if (result.rows.length > 0) {
      const sum = result.rows.reduce((acc, r) => acc + r.rating, 0);
      averageRating = parseFloat((sum / result.rows.length).toFixed(1));
    }

    res.status(200).json({
      status: 'success',
      count: result.rows.length,
      average_rating: averageRating,
      reviews: result.rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Submit a review rating and feedback comments for a product
 * @route   POST /api/reviews
 * @access  Private (JWT Auth)
 */
export const createReview = async (req, res, next) => {
  try {
    const { product_id, rating, comment } = req.body;
    const ratingNum = parseInt(rating);

    if (!product_id || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required and rating must be an integer between 1 and 5.'
      });
    }

    // Check if product exists
    const prodCheck = await query('SELECT id FROM products WHERE id = $1', [product_id]);
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.'
      });
    }

    // Insert or update review (UPSERT pattern via ON CONFLICT)
    const sql = `
      INSERT INTO reviews (user_id, product_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await query(sql, [req.user.id, product_id, ratingNum, comment || null]);

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully.',
      review: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
