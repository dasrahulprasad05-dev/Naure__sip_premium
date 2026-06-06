/* ==========================================================================
   NatureSip Centralized Error Coordination Middleware
   ========================================================================== */

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log developer server traceback
  console.error(`[Error Handler] Exception triggered on ${req.method} ${req.url}:`, err.message);

  // PostgreSQL duplicate unique constraint violation (code 23505)
  if (err.code === '23505' || err.message.includes('unique constraint')) {
    return res.status(409).json({
      status: 'error',
      message: 'An account with this email address already exists.'
    });
  }

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
};
