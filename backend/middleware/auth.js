/* ==========================================================================
   NatureSip JWT Security Guard Middleware
   ========================================================================== */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'naturesip_premium_secure_session_key_2026';

// Strict Guard: Denies request if valid token is missing
export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. Sign in to retrieve account statistics.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Session has expired or authentication token is invalid. Please sign in again.'
    });
  }
};

// Optional Guard: Parses token if present, but does not block requests if missing
export const optionalProtect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
    } catch (err) {
      // Fail silently: request remains unauthenticated but allowed to proceed
    }
  }
  
  next();
};

// Strict Admin Guard: Checks if authenticated user has is_admin role
export const admin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. Authentication required.'
    });
  }

  try {
    const userResult = await query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Administrator privileges required.'
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};
