/* ==========================================================================
   NatureSip Account Register & Authentication Controller
   ========================================================================== */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'naturesip_premium_secure_session_key_2026';

// Token generation helper
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password values are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must contain at least 6 characters.'
      });
    }

    // Encrypt / hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Save into database
    const sql = 'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at';
    const result = await query(sql, [name, email.toLowerCase().trim(), password_hash]);
    const newUser = result.rows[0];

    // Generate JWT access token
    const token = generateToken(newUser.id, newUser.email);

    try {
      const emailResult = await sendWelcomeEmail(newUser.email, newUser.name);
      console.log('📧 Welcome email result:', JSON.stringify(emailResult));
    } catch (err) {
      console.error('❌ Welcome email error:', err.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate user and retrieve token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password details.'
      });
    }

    // Lookup user profile by email
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email.toLowerCase().trim()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email address or password credentials.'
      });
    }

    // Compare input password with hashed database storage
    const passwordsMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordsMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email address or password credentials.'
      });
    }

    // Sign active session JWT token
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    next(err);
  }
};
