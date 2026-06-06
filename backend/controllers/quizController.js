/* ==========================================================================
   NatureSip Wellness Quiz Results Controller
   ========================================================================== */
import { query } from '../config/db.js';

/**
 * @desc    Save user flavor quiz results
 * @route   POST /api/quiz/results
 * @access  Public (Optional User Session integration)
 */
export const saveQuizResult = async (req, res, next) => {
  try {
    const { primary_recommendation, quiz_answers } = req.body;

    // Validate inputs
    if (!primary_recommendation || !quiz_answers) {
      return res.status(400).json({
        status: 'error',
        message: 'Primary recommendation and answers are required fields.'
      });
    }

    // Optional user authentication association
    const user_id = req.user ? req.user.id : null;

    // Insert quiz results record
    const sql = 'INSERT INTO quiz_results (user_id, primary_recommendation, quiz_answers) VALUES ($1, $2, $3) RETURNING *';
    const result = await query(sql, [
      user_id,
      primary_recommendation,
      typeof quiz_answers === 'string' ? quiz_answers : JSON.stringify(quiz_answers)
    ]);
    const newQuiz = result.rows[0];

    res.status(200).json({
      status: 'success',
      message: 'Quiz recommendation captured successfully.',
      recommended_flavor: newQuiz.primary_recommendation,
      saved: true
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user flavor quiz recommendations history
 * @route   GET /api/quiz/results
 * @access  Private (Authentication Required)
 */
export const getQuizResults = async (req, res, next) => {
  try {
    const sql = 'SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await query(sql, [req.user.id]);

    res.status(200).json({
      status: 'success',
      count: result.rows.length,
      results: result.rows
    });
  } catch (err) {
    next(err);
  }
};

